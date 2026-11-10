import type { ComponentType, ReactNode } from 'react';

export type PageWithLayout<P = {}> = ComponentType<P> & {
    layout?: (page: ReactNode) => ReactNode;
};
