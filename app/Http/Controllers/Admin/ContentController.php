<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Support\MediaUploader;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Shared CRUD flow for portfolio content that has "sort_order" and
 * "is_published" columns. Subclasses describe the model, its validation
 * rules and any relations; the request handling lives here once.
 */
abstract class ContentController extends Controller
{
    public function __construct(protected MediaUploader $uploader) {}

    /**
     * @return class-string<Model>
     */
    abstract protected function model(): string;

    /**
     * Directory of the Inertia pages, e.g. "admin/Experience".
     */
    abstract protected function page(): string;

    /**
     * Route name prefix, e.g. "admin.experiences".
     */
    abstract protected function routeName(): string;

    /**
     * Singular label used in feedback messages.
     */
    abstract protected function label(): string;

    /**
     * @return array<string, mixed>
     */
    abstract protected function rules(Request $request, ?Model $record): array;

    /**
     * Columns matched by the listing's search box.
     *
     * @return list<string>
     */
    protected function searchable(): array
    {
        return [];
    }

    /**
     * Relations to eager load for listings and forms.
     *
     * @return list<string>
     */
    protected function relations(): array
    {
        return [];
    }

    /**
     * Upload field name => foreign key column, e.g. ['media_upload' => 'media_id'].
     *
     * @return array<string, string>
     */
    protected function mediaFields(): array
    {
        return [];
    }

    /**
     * Extra props for the create and edit pages.
     *
     * @return array<string, mixed>
     */
    protected function formProps(): array
    {
        return [];
    }

    /**
     * Extra props for the listing page.
     *
     * @return array<string, mixed>
     */
    protected function indexProps(): array
    {
        return [];
    }

    /**
     * Hook for syncing relations after the record has been saved.
     *
     * @param  array<string, mixed>  $data
     */
    protected function afterSave(Model $record, array $data): void
    {
        //
    }

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $records = $this->model()::query()
            ->with($this->relations())
            ->when($search !== '' && $this->searchable() !== [], function (Builder $query) use ($search): void {
                $query->where(function (Builder $inner) use ($search): void {
                    foreach ($this->searchable() as $column) {
                        $inner->orWhereLike($column, '%'.$search.'%');
                    }
                });
            })
            ->orderBy('sort_order')
            ->orderBy('id')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render($this->page().'/Index', [
            'records' => $records,
            'filters' => ['search' => $search],
            ...$this->indexProps(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render($this->page().'/Form', [
            'record' => null,
            ...$this->sharedFormProps(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->save($this->model()::query()->newModelInstance(), $request);

        return redirect()->route($this->routeName().'.index')->with('success', $this->label().' created.');
    }

    public function edit(int $record): Response
    {
        return Inertia::render($this->page().'/Form', [
            'record' => $this->find($record),
            ...$this->sharedFormProps(),
        ]);
    }

    public function update(Request $request, int $record): RedirectResponse
    {
        $this->save($this->find($record), $request);

        return redirect()->route($this->routeName().'.index')->with('success', $this->label().' updated.');
    }

    public function destroy(int $record): RedirectResponse
    {
        try {
            $this->find($record)->delete();
        } catch (QueryException) {
            return back()->with('error', $this->label().' is still in use and cannot be deleted.');
        }

        return redirect()->route($this->routeName().'.index')->with('success', $this->label().' deleted.');
    }

    /**
     * Flip the public visibility of a record.
     */
    public function toggle(int $record): RedirectResponse
    {
        $model = $this->find($record);
        $model->update(['is_published' => ! $model->is_published]);

        return back()->with('success', $this->label().($model->is_published ? ' is now visible.' : ' is now hidden.'));
    }

    /**
     * Move a record one position up or down in the display order.
     */
    public function move(Request $request, int $record): RedirectResponse
    {
        $direction = $request->validate(['direction' => ['required', Rule::in(['up', 'down'])]])['direction'];

        static::reorder($this->model(), $record, $direction);

        return back();
    }

    /**
     * Swap a row with its neighbour and renumber the whole list.
     *
     * @param  class-string<Model>  $model
     */
    public static function reorder(string $model, int $id, string $direction): void
    {
        DB::transaction(function () use ($model, $id, $direction): void {
            $ids = $model::query()->orderBy('sort_order')->orderBy('id')->pluck('id')->all();
            $from = array_search($id, $ids, true);
            $to = $direction === 'up' ? $from - 1 : $from + 1;

            if ($from === false || ! isset($ids[$to])) {
                return;
            }

            [$ids[$from], $ids[$to]] = [$ids[$to], $ids[$from]];

            foreach ($ids as $position => $rowId) {
                $model::query()->whereKey($rowId)->update(['sort_order' => $position + 1]);
            }
        });
    }

    protected function find(int $id): Model
    {
        return $this->model()::query()->with($this->relations())->findOrFail($id);
    }

    protected function save(Model $record, Request $request): void
    {
        $rules = $this->rules($request, $record->exists ? $record : null);

        $data = $request->validate([
            ...$rules,
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'is_published' => ['required', 'boolean'],
        ]);

        // Multipart requests omit empty lists entirely; treat a missing list as cleared.
        foreach ($rules as $field => $fieldRules) {
            if (! str_contains($field, '.') && in_array('array', (array) $fieldRules, true)) {
                $data[$field] ??= [];
            }
        }

        DB::transaction(function () use ($record, $request, $data): void {
            foreach ($this->mediaFields() as $uploadField => $column) {
                if ($request->hasFile($uploadField)) {
                    $data[$column] = $this->uploader->store($request->file($uploadField))->id;
                }

                unset($data[$uploadField]);
            }

            $data['sort_order'] ??= $record->exists
                ? $record->sort_order
                : ((int) $this->model()::query()->max('sort_order')) + 1;

            $record->fill(array_intersect_key($data, array_flip($record->getFillable())))->save();

            $this->afterSave($record, $data);
        });
    }

    /**
     * @return array<string, mixed>
     */
    private function sharedFormProps(): array
    {
        return [
            ...($this->mediaFields() !== [] ? ['mediaLibrary' => static::mediaLibrary()] : []),
            ...$this->formProps(),
        ];
    }

    /**
     * Recent images offered by the media picker.
     *
     * @return list<array{id: int, url: string, name: string}>
     */
    public static function mediaLibrary(): array
    {
        return Media::query()
            ->whereLike('mime_type', 'image/%')
            ->latest('id')
            ->limit(60)
            ->get()
            ->map(fn (Media $media): array => [
                'id' => $media->id,
                'url' => $media->url,
                'name' => $media->original_name,
            ])
            ->all();
    }
}
