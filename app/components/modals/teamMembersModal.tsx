import { UserStateContext, UserActionContext } from "@/app/providers/userProvider"; // Adjust path as needed
import { useContext, useEffect, useMemo } from "react";
import { Select } from "antd";

export const TeamMemberSelect = ({ onSelect }: { onSelect: (userId: string) => void }) => {
    const { users, isPending, filters } = useContext(UserStateContext);
    const userActions = useContext(UserActionContext);

    useEffect(() => {
        // Only fetch if we don't have users yet or to ensure we have the latest active users
        if (!users || users.length === 0) {
            userActions?.getUsers({ ...filters, isActive: true, pageSize: 100 });
        }
    }, []);

    // Map the users from context to Ant Design Select options
    const options = useMemo(() => {
        return (users || []).map((u) => ({
            label: u.fullName || `${u.firstName} ${u.lastName}`,
            value: u.id,
        }));
    }, [users]);

    return (
        <Select
            showSearch
            loading={isPending}
            placeholder="Search for a team member..."
            optionFilterProp="label"
            style={{ width: '100%' }}
            onChange={(value) => onSelect(value)}
            options={options}
            filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
        />
    );
};