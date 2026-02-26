"use client";

import React, { useEffect, useContext } from "react";
import { Modal, Form, Select, Input, Button, message, Typography } from "antd";
import { 
  OpportunityActionContext, 
  OpportunityStateContext, 
} from "@/app/providers/opportunitiesProvider";
import { IOpportunity } from "@/app/providers/opportunitiesProvider/context";
import { useStyles } from "../../dashboard/style";

const { Text } = Typography;

interface Props {
  opportunity: IOpportunity | null;
  open: boolean;
  onCancel: () => void;
}

const STAGES = [
  { value: 1, label: "DISCOVERY" },
  { value: 2, label: "PROPOSAL" },
  { value: 3, label: "NEGOTIATION" },
  { value: 4, label: "WON" },
  { value: 5, label: "LOST" },
];

export default function MoveStageModal({ opportunity, open, onCancel }: Props) {
  const { styles } = useStyles();
  const [form] = Form.useForm();
  
  const actions = useContext(OpportunityActionContext);
  const { isPending } = useContext(OpportunityStateContext);

  // Synchronize form values when the selected opportunity changes
  useEffect(() => {
    if (opportunity && open) {
      form.setFieldsValue({
        stage: opportunity.stage,
        reason: "", // Clear reason for a new transition
      });
    }
  }, [opportunity, open, form]);

  const onFinish = async (values: { stage: number; reason: string }) => {
    if (!opportunity) return;

    try {
      // API call: PUT /api/opportunities/{id}/stage
      await actions?.updateStage(opportunity.id, values.stage, values.reason);
      
      message.success({
        content: `Opportunity successfully moved to ${STAGES.find(s => s.value === values.stage)?.label}`,
        style: { marginTop: '10vh' }
      });
      
      onCancel();
      form.resetFields();
    } catch (error) {
      // Error is handled by the provider, but we catch it here to prevent modal closing
      console.error("Transition failed", error);
    }
  };

  return (
    <Modal
      title={
        <div style={{ paddingBottom: 10 }}>
          <Text style={{ color: '#595959', fontSize: 10, letterSpacing: 1 }}>PIPELINE TRANSITION</Text>
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>{opportunity?.title}</div>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={450}
      styles={{
        mask: { backdropFilter: 'blur(4px)' },
        header: { background: 'transparent', borderBottom: '1px solid #1a1a1a' },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ stage: opportunity?.stage }}
        style={{ marginTop: 20 }}
      >
        <Form.Item
          name="stage"
          label={<LabelText>NEW PIPELINE STAGE</LabelText>}
          rules={[{ required: true, message: 'Please select a stage' }]}
        >
          <Select 
            className={styles.searchInput} 
            popupClassName={styles.drawerSelectPopup}
            placeholder="Select new stage"
          >
            {STAGES.map((s) => (
              <Select.Option key={s.value} value={s.value}>
                {s.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="reason"
          label={<LabelText>REASON / STATUS UPDATE</LabelText>}
          rules={[{ required: true, message: 'Transition reason is required' }]}
        >
          <Input.TextArea
            className={styles.searchInput}
            placeholder="e.g., Client requested a final quote adjustment..."
            rows={4}
            style={{ 
              height: 'auto', 
              background: '#000', 
              padding: '12px',
              borderRadius: 4 
            }}
          />
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 40 }}>
          <Button 
            onClick={onCancel} 
            style={{ color: '#8c8c8c', border: '1px solid #434343', background: 'transparent' }}
          >
            Cancel
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isPending}
            className={styles.primaryButton}
          >
            Confirm Transition
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

// Helper component for consistent label styling
const LabelText = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: '#595959', fontSize: 11, fontWeight: 600, letterSpacing: 0.5 }}>
    {children}
  </span>
);