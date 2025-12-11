import './AdminPage.styles.scss';
import AdminBar from './AdminBar.component';
import StreetcodeCatalogComponent from '../StreetcodeCatalogPage/StreetcodeCatalog.component';
import InterestingFactsModal from '../../app/common/components/modals/InterestingFacts/FactsAdminModal/InterestingFactsAdminModal.component'
import { useState } from 'react';
import useMobx from '../../app/stores/root-store';

const AdminPage = () => {
    const { factsStore, modalStore } = useMobx();
    const {
        modalsState: { adminFacts },
        setModal
    } = modalStore;
    const [editFact, setEditFact] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [modalKey, setModalKey] = useState(0);

    const openCreateModal = () => {
        setEditFact(null);
        setIsEdit(false);
        setModal('adminFacts', undefined, true);
        setModalKey(key => key + 1);
    };
    const openEditModal = async () => {
        const fact = factsStore.factMap.get(20) || await factsStore.fetchFactsByStreetcodeId(1).then((arr: any[]) => arr.find((f: any) => f.id === 20));
        if (fact) {
            setEditFact(fact);
            setIsEdit(true);
            setModal('adminFacts', undefined, true);
            setModalKey(key => key + 1);
        } else {
            alert('Факт з id=20 не знайдено');
        }
    };
    const deleteFact = async () => {
        await factsStore.deleteFact(20);
        alert('Факт з id=20 видалено (якщо існував)');
    };

    return (
        <>
        <div className="adminPageContainer" >
            <AdminBar />
            <StreetcodeCatalogComponent />
            <div style={{margin: '24px 0', display: 'flex', gap: 16}}>
                <button onClick={openCreateModal} style={{padding: '8px 16px'}}>Створити факт</button>
                <button onClick={openEditModal} style={{padding: '8px 16px'}}>Оновити факт (id=20)</button>
                <button onClick={deleteFact} style={{padding: '8px 16px', color: 'white', background: '#e53935', border: 'none', borderRadius: 8}}>Видалити факт (id=20)</button>
            </div>
        </div>
        {adminFacts.isOpen && (
          <InterestingFactsModal
            key={modalKey}
            streetcodeId={1}
            factToEdit={isEdit ? editFact : null}
          />
        )}
        </>
    );
}

export default AdminPage;
