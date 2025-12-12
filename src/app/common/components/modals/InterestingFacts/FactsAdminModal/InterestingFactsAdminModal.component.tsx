import './InterestingFactsAdminModal.styles.scss';

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
    factToEdit?: Fact | null; // <-- new optional prop for edit mode
}

const InterestingFactsModal = ({ streetcodeId = 1, factToEdit = null }: InterestingFactsModalProps) => {
    const { modalStore, factsStore, imagesStore: { getImageArray, createImage, updateImage } } = useMobx();
    const { setModal, modalsState: { adminFacts } } = modalStore;

    if (!adminFacts.isOpen) return null;

    // Prefill state for edit
    const [factContent, setFactContent] = useState(factToEdit ? factToEdit.factContent : '');
    const [title, setTitle] = useState(factToEdit ? factToEdit.title : '');
    const [imageId, setImageId] = useState<number | undefined>(factToEdit ? factToEdit.imageId : undefined); // Only number or undefined
    const [imageDescription, setImageDescription] = useState<string | undefined>(factToEdit ? factToEdit.imageDescription : '');

    // Upload state for edit mode
    const [fileList, setFileList] = useState<UploadFile<any>[]>([]);

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
        let imgId = imageId;

        // Handle image: if user uploads a new one, process; else keep old for edit
        if (values.picture && values.picture.file) {
            const uploadedFile = values.picture.file as UploadFile<any>;
            const file = uploadedFile.originFileObj as File;
            const fileName = uploadedFile.name ?? '';
            const extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
            const base64 = await fileToBase64(file);
            const imageToCreate: ImageCreate = {
                title: values.title || fileName,
                baseFormat: base64,
                mimeType: file.type ?? 'image/jpeg',
                extension: extension,
            };
            const createdImage = await createImage(imageToCreate);
            if (!createdImage) throw new Error('Не вдалося створити зображення');
            imgId = createdImage.id;
        }

        // imageId is required
        if (!imgId) throw new Error('Зображення є обовʼязковим');

        if (factToEdit) {
            // Edit Fact: Update the fact (must send all fields)
            const fact: Fact = {
                id: factToEdit.id,
                title,
                factContent,
                imageId: imgId,
            };
            await factsStore.updateFact(fact);
        } else {
            // Create Fact
            const fact: FactCreate = {
                title,
                factContent,
                imageId: imgId,
                streetcodeId: streetcodeId,
            };
            await factsStore.createFact(fact);
        }
        setModal('adminFacts', undefined, false);
    };

    return (
        <Modal
            className="interestingFactsAdminModal"
            open={true}
            onCancel={() => setModal('adminFacts', undefined, false)}
            footer={null}
            maskClosable
            centered
            closeIcon={<CancelBtn />}
        >
            <Form className="factForm" onFinish={onFinish}
                  initialValues={{
                    title: title,
                    mainText: factContent,
                    // Removed imageDescription
                  }}>
                <h2>Wow-Факт</h2>
                <div className="inputBlock">
                    <p>Заголовок</p>
                    <Form.Item name="title" rules={[{ required: true, message: 'Поле обовʼязкове' }]}> {/* add required validation */}
                        <input value={title} onChange={e => setTitle(e.target.value)} maxLength={68}/>
                    </Form.Item>
                </div>
                <div className="textareaBlock">
                    <p>Основний текст</p>
                    <Form.Item name="mainText" rules={[{ required: true, message: 'Поле обовʼязкове' }]}> {/* add required validation */}
                        <textarea value={factContent} maxLength={600} onChange={(e) => setFactContent(e.target.value)} />
                    </Form.Item>
                    <p className="characterCounter">
                        {characterCount}/600
                    </p>
                </div>
                <div className="uploadBlock">
                    <p>Зображення:</p>
                    <FormItem name="picture" className="">
                        <Upload
                            multiple={false}
                            accept=".jpeg,.png,.jpg,.webp"
                            listType="picture-card"
                            maxCount={1}
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList)}
                            beforeUpload={() => false} // prevent auto upload
                        >
                            <div className="upload">
                                <InboxOutlined />
                                <p>Виберіть чи перетягніть файл</p>
                            </div>
                        </Upload>
                    </FormItem>
                </div>
                <div className="imageDescriptionBlock">
                    <p>Підпис до фото</p>
                    <Form.Item name="imageDescription" rules={[{ required: true, message: 'Поле обовʼязкове' }]}>
                        <input value={imageDescription} onChange={e => setTitle(e.target.value)} maxLength={68}/>
                    </Form.Item>
                </div>
                <Button className="saveButton" htmlType="submit">{factToEdit ? 'Оновити' : 'Зберегти'}</Button>
            </Form>
        </Modal>
    );
};

export default observer(InterestingFactsModal);
