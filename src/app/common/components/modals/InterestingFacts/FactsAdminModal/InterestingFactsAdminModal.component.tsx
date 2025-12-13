import './InterestingFactsAdminModal.styles.scss';

import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
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

    const [form] = Form.useForm(); // <-- Створюємо інстанс форми

    if (!adminFacts.isOpen) return null;

    useEffect(() => {
        if (factToEdit) {
            form.setFieldsValue({
                title: factToEdit.title,
                mainText: factToEdit.factContent,
                imageDescription: factToEdit.imageDescription,
            });
        }
    }, [factToEdit, form]);

    // Upload state for edit mode
    const [fileList, setFileList] = useState<UploadFile<any>[]>([]);

    const mainTextValue = Form.useWatch('mainText', form) || '';
    const characterCount = mainTextValue.length;

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
        let imgId = factToEdit?.imageId;

        // Handle image
        if (values.picture && values.picture.fileList && values.picture.fileList.length > 0) {
            const uploadedFile = values.picture.fileList[0]; // <-- Беремо з fileList
            const file = uploadedFile.originFileObj as File; // <-- Це справжній File
            
            if (!file) {
                Modal.error({ title: 'Помилка', content: 'Не вдалося отримати файл' });
                return;
            }
            
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
            if (!createdImage) {
                Modal.error({ title: 'Помилка', content: 'Не вдалося створити зображення' });
                return;
            }
            imgId = createdImage.id;
        }

        // imageId is required (for create mode)
        if (!imgId && !factToEdit) {
            Modal.error({ title: 'Помилка', content: 'Зображення є обовʼязковим' });
            return;
        }

        if (factToEdit) {
            // Edit Fact
            const fact: Fact = {
                id: factToEdit.id,
                title: values.title,
                factContent: values.mainText,
                imageId: imgId!,
                order: factToEdit.order,
                imageDescription: values.imageDescription,
            };
            await factsStore.updateFact(fact);
        } else {
            // Create Fact
            const fact: FactCreate = {
                title: values.title,
                factContent: values.mainText,
                imageId: imgId!,
                imageDescription: values.imageDescription,
                streetcodeId: streetcodeId,
            };
            await factsStore.createFact(fact);
        }
        
        form.resetFields();
        setModal('adminFacts', undefined, false);
    };

    return (
        <Modal
            className="interestingFactsAdminModal"
            open={true}
            onCancel={() => {
                form.resetFields();
                setModal('adminFacts', undefined, false);
            }}
            footer={null}
            maskClosable
            centered
            closeIcon={<CancelBtn />}
        >
            <Form 
                form={form}
                className="factForm" 
                onFinish={onFinish}
                initialValues={{
                    title: factToEdit?.title || '',
                    mainText: factToEdit?.factContent || '',
                    imageDescription: factToEdit?.imageDescription || '',
                }}
            >
                <h2>Wow-Факт</h2>
                
                <div className="inputBlock">
                    <p>Заголовок</p>
                    <Form.Item 
                        name="title" 
                        rules={[
                            { required: true, message: 'Поле обовʼязкове' },
                            { max: 68, message: 'Максимум 68 символів' }
                        ]}
                    >
                        <input maxLength={68} />
                    </Form.Item>
                </div>
                
                <div className="textareaBlock">
                    <p>Основний текст</p>
                    <Form.Item 
                        name="mainText" 
                        rules={[
                            { required: true, message: 'Поле обовʼязкове' },
                            { max: 600, message: 'Максимум 600 символів' }
                        ]}
                    >
                        <textarea maxLength={600} />
                    </Form.Item>
                    <p className="characterCounter">
                        {characterCount}/600
                    </p>
                </div>
                
                <div className="uploadBlock">
                    <p>Зображення:</p>
                    <FormItem 
                        name="picture"
                        rules={[
                            { required: !factToEdit, message: 'Зображення обовʼязкове' }
                        ]}
                    >
                        <Upload
                            multiple={false}
                            accept=".jpeg,.png,.jpg,.webp"
                            listType="picture-card"
                            maxCount={1}
                            beforeUpload={() => false}
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
                    <Form.Item 
                        name="imageDescription"
                        rules={[
                            { required: true, message: 'Поле обовʼязкове' },
                            { max: 200, message: 'Максимум 200 символів' }
                        ]}
                    >
                        <input maxLength={200} />
                    </Form.Item>
                </div>
                
                <Button className="saveButton" htmlType="submit">
                    {factToEdit ? 'Оновити' : 'Зберегти'}
                </Button>
            </Form>
        </Modal>
    );
};

export default observer(InterestingFactsModal);
