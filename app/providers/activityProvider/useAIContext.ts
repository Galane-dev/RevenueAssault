import { useContext, useMemo } from 'react';
import { ActivityStateContext, ActivityPriority, ActivityStatus, ActivityType } from './context';

export const useAIActivitiesContext = () => {
    const { activities, filters, totalCount } = useContext(ActivityStateContext);

    return useMemo(() => {
        if (!activities) {
            return {
                totalActivities: 0,
                displayedActivities: 0,
                activities: [],
                summary: {
                    completed: 0,
                    scheduled: 0,
                    overdue: 0,
                },
                filters: {
                    type: null,
                    status: null,
                    priority: null,
                    pageNumber: 1,
                },
            };
        }

        const now = new Date();
        const list = activities || [];

        return {
            totalActivities: totalCount,
            displayedActivities: list.length,
            activities: list.map((activity) => ({
                id: activity.id,
                subject: activity.subject,
                type: ActivityType[activity.type],
                status: ActivityStatus[activity.status],
                priority: ActivityPriority[activity.priority],
                dueDate: activity.dueDate,
            })),
            summary: {
                completed: list.filter((activity) => activity.status === ActivityStatus.Completed).length,
                scheduled: list.filter((activity) => activity.status === ActivityStatus.Scheduled).length,
                overdue: list.filter(
                    (activity) =>
                        activity.status === ActivityStatus.Scheduled &&
                        new Date(activity.dueDate) < now
                ).length,
            },
            filters: {
                type: filters.type ? ActivityType[filters.type] : null,
                status: filters.status ? ActivityStatus[filters.status] : null,
                priority: filters.priority ? ActivityPriority[filters.priority] : null,
                pageNumber: filters.pageNumber,
            },
        };
    }, [activities, totalCount, filters]);
};

export default useAIActivitiesContext;