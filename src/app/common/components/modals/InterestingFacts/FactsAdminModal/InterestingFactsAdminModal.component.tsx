// import './InterestingFactsAdminModal.style.scss';

import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import CancelBtn from '@assets/images/utils/Cancel_btn.svg';
import useMobx from '@stores/root-store';

import { Button, Form, Modal, Upload } from 'antd';
import FormItem from 'antd/es/form/FormItem';
import { UploadFile } from 'antd/lib/upload/interface';

import Image, { ImageCreate } from '@/models/media/image.model';
import { Fact, FactCreate } from '@/models/streetcode/text-contents.model';

interface InterestingFactsModalProps {
    streetcodeId: number;
}

const InterestingFactsModal = ({ streetcodeId = 1 }: InterestingFactsModalProps) => {
    const { modalStore, factsStore, imagesStore: { getImageArray, createImage } } = useMobx();
    const { setModal, modalsState: { adminFacts } } = modalStore;
    const [factContent, setFactContent] = useState('');

    const characterCount = factContent.length | 0;

    // Допоміжна функція: конвертує File в base64 string (data URL format)
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const onFinish = async (values: any) => {
        // 1. Отримуємо файл з форми (Ant Design Upload component)
        const uploadedFile = values.picture.file as UploadFile<any>;
        const file = uploadedFile.originFileObj as File;

        // 2. Витягуємо ім'я файлу (якщо є, інакше порожній рядок)
        const fileName = uploadedFile.name ?? '';
        
        // 3. Витягуємо розширення файлу (наприклад, "jpg", "png")
        const extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        
        const base64 = await fileToBase64(file);

        // 4. Створюємо об'єкт ImageCreate для завантаження зображення
        const imageToCreate: ImageCreate = {
            title: values.title || fileName,         // Назва зображення
            baseFormat: base64,
            mimeType: file.type ?? 'image/jpeg',     // image/jpeg, image/png, etc.
            extension: extension,                     // jpg, png, jpeg, webp
        };

        const createdImage = await createImage(imageToCreate);

        if (createdImage === null)
        {
            if (createdImage === null) {
                throw new Error('Не вдалося створити зображення');
            }
        }
        
        const fact: FactCreate = {
            title: values.title,
            factContent: factContent,
            imageId: createdImage.id,
            streetcodeId: streetcodeId
        };

        await factsStore.createFact(fact);
        
        // Close the modal
        setModal('adminFacts');
    };

    return (
        <Modal
            className="interestingFactsAdminModal"
            open={true}
            onCancel={() => setModal('adminFacts')}
            footer={null}
            maskClosable
            centered
            closeIcon={<CancelBtn />}
        >
            <Form className="factForm" onFinish={onFinish}>
                <h2>Wow-Факт</h2>
                <p>Заголовок</p>
                <div className="inputBlock">
                    <Form.Item name="title">
                        <input />
                    </Form.Item>
                    <p>Основний текст</p>
                    <textarea value={factContent} maxLength={600} onChange={(e) => setFactContent(e.target.value)} />
                    <p className="characterCounter">
                        {characterCount}
                        /600
                    </p>
                </div>
                <p>Зображення:</p>
                <FormItem
                    name="picture"
                    className=""
                >
                    <Upload
                        multiple={false}
                        accept=".jpeg,.png,.jpg"
                        listType="picture-card"
                        maxCount={1}
                    >
                        <div className="upload">
                            <InboxOutlined />
                            <p>Виберіть чи перетягніть файл</p>
                        </div>
                    </Upload>
                </FormItem>
                <Button className="saveButton" htmlType="submit">Зберегти</Button>
            </Form>
        </Modal>
    );
};

export default observer(InterestingFactsModal);
