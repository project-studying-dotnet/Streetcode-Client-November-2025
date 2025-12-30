import './ChronologyModal.styles.scss';
import '@features/AdminPage/AdminModal.styles.scss';

import CancelBtn from '@images/utils/Cancel_btn.svg';

import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import TimelineItem, {
    DateViewPattern,
    HistoricalContext,
    selectDateOptionsforTimeline,
} from '@models/timeline/chronology.model';
import useMobx from '@stores/root-store';

import {
    Button,
    DatePicker,
    Form,
    Input,
    Modal,
    Select,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/uk';

dayjs.locale('uk');

const { Option } = Select;

const ChronologyModal: React.FC<{
    timelineItem?: TimelineItem;
    open: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    afterSubmit?: () => void;
}> = observer(({ timelineItem, open, setIsModalOpen, afterSubmit }) => {
    const [form] = Form.useForm();
    const { timelineItemStore, historicalContextStore } = useMobx();
    const [dateType, setDateType] = useState<'date' | 'month' | 'year' | 'season-year'>('date');
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [contexts, setContexts] = useState<HistoricalContext[]>([]);
    const [selectedContexts, setSelectedContexts] = useState<number[]>([]);
    const [titleCount, setTitleCount] = useState(0);
    const [descriptionCount, setDescriptionCount] = useState(0);
    const [contextInputValue, setContextInputValue] = useState('');
    const [contextError, setContextError] = useState('');

    const maxTitleLength = 28;
    const maxDescriptionLength = 400;
    const maxContextLength = 50;

    useEffect(() => {
        historicalContextStore.fetchHistoricalContextAll().then(() => {
            setContexts(historicalContextStore.historicalContextArray);
        });
    }, []);

    useEffect(() => {
        if (timelineItem && open) {
            const date = dayjs(timelineItem.date);
            setSelectedDate(date);
            
            let type: 'date' | 'month' | 'year' | 'season-year' = 'date';
            switch (timelineItem.dateViewPattern) {
                case DateViewPattern.Year:
                    type = 'year';
                    break;
                case DateViewPattern.MonthYear:
                    type = 'month';
                    break;
                case DateViewPattern.SeasonYear:
                    type = 'season-year';
                    break;
                default:
                    type = 'date';
            }
            setDateType(type);

            form.setFieldsValue({
                title: timelineItem.title,
                description: timelineItem.description,
                dateType: type,
                historicalContexts: timelineItem.historicalContexts?.map((c) => c.id) || [],
            });
            
            setTitleCount(timelineItem.title?.length || 0);
            setDescriptionCount(timelineItem.description?.length || 0);
            setSelectedContexts(timelineItem.historicalContexts?.map((c) => c.id) || []);
        } else if (open) {
            form.resetFields();
            setSelectedDate(null);
            setDateType('date');
            setSelectedContexts([]);
            setTitleCount(0);
            setDescriptionCount(0);
            setContextInputValue('');
            setContextError('');
        }
    }, [timelineItem, open, form]);

    const handleCancel = () => {
        form.resetFields();
        setIsModalOpen(false);
        setSelectedDate(null);
        setSelectedContexts([]);
        setTitleCount(0);
        setDescriptionCount(0);
        setContextInputValue('');
        setContextError('');
    };

    const getDateViewPattern = (type: string): DateViewPattern => {
        switch (type) {
            case 'year':
                return DateViewPattern.Year;
            case 'month':
                return DateViewPattern.MonthYear;
            case 'season-year':
                return DateViewPattern.SeasonYear;
            default:
                return DateViewPattern.DateMonthYear;
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            
            if (!selectedDate) {
                form.setFields([{ name: 'date', errors: ['Дата обов\'язкова'] }]);
                return;
            }

            const selectedContextObjects = contexts.filter((c) => 
                selectedContexts.includes(c.id)
            );

            const timelineData: TimelineItem = {
                id: timelineItem?.id || 0,
                date: selectedDate.toDate(),
                dateViewPattern: getDateViewPattern(dateType),
                title: values.title.trim(),
                description: values.description?.trim() || '',
                historicalContexts: selectedContextObjects,
            };

            if (timelineItem) {
                await timelineItemStore.updateTimelineItem(timelineData);
            } else {
                await timelineItemStore.createTimelineItem(timelineData);
            }

            if (afterSubmit) {
                afterSubmit();
            }
            handleCancel();
        } catch (error) {
            console.error('Form validation failed:', error);
        }
    };

    const handleDateTypeChange = (value: 'date' | 'month' | 'year' | 'season-year') => {
        setDateType(value);
        setSelectedDate(null);
        form.setFieldsValue({ date: null });
    };

    const getDatePicker = () => {
        const commonProps = {
            value: selectedDate,
            onChange: (date: Dayjs | null) => {
                setSelectedDate(date);
                form.setFieldsValue({ date });
            },
            format: dateType === 'year' ? 'YYYY' : dateType === 'month' ? 'YYYY, MMMM' : 'YYYY, D MMMM',
            placeholder: 'Оберіть дату',
            style: { width: '100%' },
        };

        if (dateType === 'year') {
            return <DatePicker {...commonProps} picker="year" />;
        }
        if (dateType === 'month') {
            return <DatePicker {...commonProps} picker="month" />;
        }
        if (dateType === 'season-year') {
            return <DatePicker {...commonProps} picker="month" />;
        }
        return <DatePicker {...commonProps} />;
    };

    const validateContextInput = (value: string): boolean => {
        if (value.length > maxContextLength) {
            setContextError(`Контекст не може бути довшим за ${maxContextLength} символів`);
            return false;
        }
        if (/[0-9]/.test(value)) {
            setContextError('Контекст не може містити цифри');
            return false;
        }
        if (/[^a-zA-Zа-яА-ЯіІїЇєЄґҐ\s\-']/.test(value)) {
            setContextError('Контекст не може містити спеціальні символи');
            return false;
        }
        if (contexts.some((c) => c.title.toLowerCase() === value.toLowerCase())) {
            setContextError('Такий контекст вже існує');
            return false;
        }
        setContextError('');
        return true;
    };

    const handleContextSearch = (value: string) => {
        setContextInputValue(value);
        if (value) {
            validateContextInput(value);
        } else {
            setContextError('');
        }
    };

    const handleContextSelect = (value: number | string) => {
        if (typeof value === 'string') {
            // New context input
            if (validateContextInput(value)) {
                const newId = Math.min(...contexts.map((c) => c.id), 0) - 1;
                const newContext: HistoricalContext = { id: newId, title: value.trim() };
                setContexts([...contexts, newContext]);
                setSelectedContexts([...selectedContexts, newId]);
                setContextInputValue('');
                setContextError('');
                form.setFieldsValue({ historicalContexts: [...selectedContexts, newId] });
            }
        } else {
            setSelectedContexts([...selectedContexts, value]);
        }
    };

    const handleContextDeselect = (value: number) => {
        setSelectedContexts(selectedContexts.filter((id) => id !== value));
    };

    return (
        <Modal
            className="chronology-modal-container"
            open={open}
            onCancel={handleCancel}
            footer={null}
            maskClosable
            centered
            closeIcon={<CancelBtn />}
        >
            <div className="chronology-modal-content">
                <h2>{timelineItem ? 'Редагувати подію' : 'Додати нову подію'}</h2>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        label={<span>Назва <span className="required-star">*</span></span>}
                        name="title"
                        rules={[
                            { required: true, message: 'Назва обов\'язкова' },
                            { max: maxTitleLength, message: `Максимум ${maxTitleLength} символів` },
                            { whitespace: true, message: 'Назва не може бути порожньою' },
                        ]}
                    >
                        <Input
                            maxLength={maxTitleLength}
                            placeholder="Введіть назву"
                            onChange={(e) => setTitleCount(e.target.value.length)}
                        />
                    </Form.Item>
                    <div className="character-counter">{titleCount} / {maxTitleLength}</div>

                    <Form.Item
                        label="Дата"
                        required
                    >
                        <Select
                            value={dateType}
                            onChange={handleDateTypeChange}
                            style={{ marginBottom: 8 }}
                        >
                            {selectDateOptionsforTimeline.map((option) => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                        <Form.Item
                            name="date"
                            rules={[{ required: true, message: 'Дата обов\'язкова' }]}
                            noStyle
                        >
                            {getDatePicker()}
                        </Form.Item>
                    </Form.Item>

                    <Form.Item
                        label="Контекст"
                        name="historicalContexts"
                    >
                        <Select
                            mode="multiple"
                            placeholder="Оберіть або введіть контекст"
                            value={selectedContexts}
                            onSelect={handleContextSelect}
                            onDeselect={handleContextDeselect}
                            onSearch={handleContextSearch}
                            searchValue={contextInputValue}
                            filterOption={(input, option) => {
                                const label = option?.label || option?.children;
                                if (typeof label === 'string') {
                                    return label.toLowerCase().includes(input.toLowerCase());
                                }
                                return false;
                            }}
                            notFoundContent={
                                contextInputValue && !contextError ? (
                                    <div style={{ padding: '8px', cursor: 'pointer' }}>
                                        Натисніть Enter щоб додати "{contextInputValue}"
                                    </div>
                                ) : null
                            }
                        >
                            {contexts.map((context) => (
                                <Option key={context.id} value={context.id}>
                                    {context.title}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    {contextError && <div className="error-message">{contextError}</div>}

                    <Form.Item
                        label={<span>Опис <span className="required-star">*</span></span>}
                        name="description"
                        rules={[
                            { required: true, message: 'Опис обов\'язковий' },
                            { max: maxDescriptionLength, message: `Максимум ${maxDescriptionLength} символів` },
                            { whitespace: true, message: 'Опис не може бути порожнім' },
                        ]}
                    >
                        <TextArea
                            rows={4}
                            maxLength={maxDescriptionLength}
                            placeholder="Введіть опис"
                            onChange={(e) => setDescriptionCount(e.target.value.length)}
                        />
                    </Form.Item>
                    <div className="character-counter">{descriptionCount} / {maxDescriptionLength}</div>

                    <div className="modal-buttons">
                        <Button onClick={handleCancel}>
                            Скасувати
                        </Button>
                        <Button type="primary" htmlType="submit">
                            {timelineItem ? 'Зберегти' : 'Додати'}
                        </Button>
                    </div>
                </Form>
            </div>
        </Modal>
    );
});

export default ChronologyModal;
