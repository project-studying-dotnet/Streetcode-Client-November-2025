import './ChronologyPage.styles.scss';

import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import useMobx, { useModalContext } from '../../../app/stores/root-store';
import TimelineItem, { DateViewPattern, dateToString, HistoricalContext } from '../../../models/timeline/chronology.model';

import ChronologyModal from '@/features/AdminPage/ChronologyPage/ChronologyModal/ChronologyModal.component';
import AdminBar from '../AdminBar.component';

const ChronologyPage = () => {
    const { timelineItemStore, historicalContextStore } = useMobx();
    const { modalStore } = useModalContext();
    const [modalAddOpened, setModalAddOpened] = useState<boolean>(false);
    const [modalEditOpened, setModalEditOpened] = useState<boolean>(false);
    const [chronologyToEdit, setChronologyToEdit] = useState<TimelineItem>();

    const fetchTimelines = async () => {
        try {
            await timelineItemStore.fetchAllTimelineItems();
        } catch (error) {
            console.error('Error fetching timelines:', error);
        }
    };

    useEffect(() => {
        fetchTimelines();
    }, []);

    const getDateFormatted = (item: TimelineItem) => {
        const date = dayjs(item.date);
        let type: 'date' | 'month' | 'year' | 'season-year' = 'date';
        
        switch (item.dateViewPattern) {
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
        
        return dateToString(type, date);
    };

    const columns: ColumnsType<TimelineItem> = [
        {
            title: 'Дата',
            dataIndex: 'date',
            key: 'date',
            width: '20%',
            render: (value, record) => (
                <div key={`${record.id}-date`}>
                    {getDateFormatted(record)}
                </div>
            ),
        },
        {
            title: 'Назва',
            dataIndex: 'title',
            key: 'title',
            width: '25%',
            render: (value, record) => (
                <div key={`${record.id}-title`} className="chronology-table-item-title">
                    <p>{value}</p>
                </div>
            ),
        },
        {
            title: 'Опис',
            dataIndex: 'description',
            key: 'description',
            width: '35%',
            render: (value, record) => (
                <div key={`${record.id}-description`} className="chronology-table-item-description">
                    <p>{value || '-'}</p>
                </div>
            ),
        },
        {
            title: 'Контекст',
            dataIndex: 'historicalContexts',
            key: 'historicalContexts',
            width: '15%',
            render: (contexts, record) => (
                <div key={`${record.id}-contexts`}>
                    {contexts?.map((ctx: HistoricalContext) => ctx.title).join(', ') || '-'}
                </div>
            ),
        },
        {
            title: 'Дії',
            dataIndex: 'action',
            key: 'action',
            width: '5%',
            render: (value, timeline, index) => (
                <div key={`${timeline.id}${index}`} className="chronology-page-actions">
                    <EditOutlined
                        key={`edit-${timeline.id}`}
                        className="actionButton"
                        onClick={() => {
                            setChronologyToEdit(timeline);
                            setModalEditOpened(true);
                        }}
                    />
                    <DeleteOutlined
                        key={`delete-${timeline.id}`}
                        className="actionButton"
                        onClick={() => {
                            modalStore.setConfirmationModal(
                                'confirmation',
                                () => {
                                    timelineItemStore.deleteTimelineItem(timeline.id)
                                        .then(() => {
                                            fetchTimelines();
                                        })
                                        .catch((e: Error) => {
                                            console.error('Delete error:', e);
                                        });
                                    modalStore.setConfirmationModal('confirmation');
                                },
                                'Ви впевнені, що хочете видалити цю подію?',
                            );
                        }}
                    />
                </div>
            ),
        },
    ];

    return (
        <div className="chronology-page-container">
            <AdminBar />
            <div className="chronology-page-content">
                <div className="chronology-page-header">
                    <h1>Хронологія</h1>
                    <Button
                        className="streetcode-custom-button add-button"
                        onClick={() => setModalAddOpened(true)}
                        icon={<PlusOutlined />}
                    >
                        Додати подію
                    </Button>
                </div>
                <Table
                    pagination={{ pageSize: 10 }}
                    className="chronology-table"
                    columns={columns}
                    dataSource={Array.from(timelineItemStore.timelineItemMap.values())}
                    rowKey="id"
                />
            </div>
            <ChronologyModal
                open={modalAddOpened}
                setIsModalOpen={setModalAddOpened}
                afterSubmit={() => fetchTimelines()}
            />
            <ChronologyModal
                timelineItem={chronologyToEdit}
                open={modalEditOpened}
                setIsModalOpen={setModalEditOpened}
                afterSubmit={() => fetchTimelines()}
            />
        </div>
    );
};

export default observer(ChronologyPage);
