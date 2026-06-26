import React from 'react';

export const Skeleton = ({ className = '', ...props }) => (
    <div
        className={`skeleton-shimmer rounded-md bg-gray-200 ${className}`}
        aria-hidden="true"
        {...props}
    />
);

export const StatCardSkeleton = () => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex justify-between items-start">
        <div className="flex flex-col flex-1 gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
    </div>
);

export const DashboardSkeleton = ({ showAdminExtras = true }) => (
    <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: showAdminExtras ? 4 : 3 }).map((_, i) => (
                <StatCardSkeleton key={i} />
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {[0, 1].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <Skeleton className="h-5 w-36 mb-2" />
                    <Skeleton className="h-4 w-28 mb-6" />
                    <Skeleton className="h-[300px] w-full rounded-lg" />
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="space-y-3">
                    <div className="flex gap-4 pb-3 border-b border-gray-100">
                        {[1, 2, 3, 4].map((c) => (
                            <Skeleton key={c} className="h-3 flex-1" />
                        ))}
                    </div>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                            <Skeleton className="h-4 w-24 hidden sm:block" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    ))}
                </div>
            </div>

            {showAdminExtras && (
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <Skeleton className="h-5 w-36 mb-4" />
                    <div className="flex flex-col gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="h-4 w-16" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
);

export const VehicleCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <Skeleton className="h-44 w-full rounded-none" />
        <div className="p-5 flex flex-col flex-1 gap-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-7 w-28 mt-1" />
            <Skeleton className="h-10 w-full rounded-lg mt-2" />
        </div>
    </div>
);

export const CardGridSkeleton = ({ count = 6, Card = VehicleCardSkeleton, columns = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3', gap = 'gap-6' }) => (
    <div className={`grid ${columns} ${gap}`}>
        {Array.from({ length: count }).map((_, i) => (
            <Card key={i} />
        ))}
    </div>
);

export const EntityCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-5 flex-1">
            <div className="flex items-start gap-4">
                <Skeleton className="w-14 h-14 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-36" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full shrink-0" />
            </div>
            <Skeleton className="h-4 w-40 mt-3" />
        </div>
        <div className="px-5 pb-5">
            <Skeleton className="h-10 w-full rounded-lg" />
        </div>
    </div>
);

export const TableSkeleton = ({ rows = 6, cols = 5 }) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex gap-4 p-4 border-b border-gray-100">
            {Array.from({ length: cols }).map((_, i) => (
                <Skeleton key={i} className="h-3 flex-1" />
            ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border-b border-gray-100 last:border-0">
                {Array.from({ length: cols }).map((_, j) => (
                    <Skeleton key={j} className="h-4 flex-1" />
                ))}
            </div>
        ))}
    </div>
);
