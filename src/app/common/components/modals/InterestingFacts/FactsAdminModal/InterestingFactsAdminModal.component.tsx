import './InterestingFactsAdminModal.styles.scss';

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import CancelBtn from '@assets/images/utils/Cancel_btn.svg';
import useMobx from '@stores/root-store';

import { Button, Form, Modal, Upload } from 'antd';
import FormItem from 'antd/es/form/FormItem';

import { ImageCreate } from '@/models/media/image.model';
import { Fact, FactCreate } from '@/models/streetcode/text-contents.model';

interface InterestingFactsModalProps {
    streetcodeId: number;
    factToEdit?: Fact | null;
}

const InterestingFactsModal = ({ streetcodeId = 1, factToEdit = null }: InterestingFactsModalProps) => {
    const { modalStore, factsStore, imagesStore: { createImage } } = useMobx();
    const { setModal, modalsState: { adminFacts } } = modalStore;
    const [form] = Form.useForm();

    const titleValue = Form.useWatch('title', form) || '';
    const mainTextValue = Form.useWatch('mainText', form) || '';
    const imageDescriptionValue = Form.useWatch('imageDescription', form) || '';

    const titleCount = titleValue.length;
    const mainTextCount = mainTextValue.length;
    const imageDescCount = imageDescriptionValue.length;

    useEffect(() => {
        if (adminFacts.isOpen && factToEdit) {
            form.setFieldsValue({
                title: factToEdit.title,
                mainText: factToEdit.factContent,
                imageDescription: factToEdit.imageDescription,
            });
        } else if (adminFacts.isOpen && !factToEdit) {
            form.resetFields();
        }
    }, [adminFacts.isOpen, factToEdit, form]);

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

    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    const onFinish = async (values: any) => {
        let imgId = factToEdit?.imageId;

        if (values.picture && values.picture.length > 0) {
            const uploadedFile = values.picture[0];
            const file = uploadedFile.originFileObj as File;
            
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

        if (!imgId && !factToEdit) {
            Modal.error({ title: 'Помилка', content: 'Зображення є обовʼязковим' });
            return;
        }

        try {
            if (factToEdit) {
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
        } catch (error) {
            Modal.error({ 
                title: 'Помилка', 
                content: 'Не вдалося зберегти факт' 
            });
            console.log("Error: Fact has not been saved!");
        }
    };

    return (
        <Modal
            className="interestingFactsAdminModal"
            open={adminFacts.isOpen}
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
            >
                <h2>Wow-Факт</h2>
                
                <div className="inputBlock">
                    <p>Заголовок</p>
                    <div className="inputWithCounter">
                        <Form.Item 
                            name="title" 
                            rules={[
                                { required: true, message: 'Поле обовʼязкове' },
                                { max: 68, message: 'Максимум 68 символів' }
                            ]}
                        >
                            <input maxLength={68} />
                        </Form.Item>
                        <span className="inputCounter">{titleCount}/68</span>
                    </div>
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
                        {mainTextCount}/600
                    </p>
                </div>
                
                <div className="uploadBlock">
                    <p>Зображення:</p>
                    <FormItem 
                        name="picture"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
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
                    <div className="inputWithCounter">
                        <Form.Item 
                            name="imageDescription"
                            rules={[
                                { required: true, message: 'Поле обовʼязкове' },
                                { max: 200, message: 'Максимум 200 символів' }
                            ]}
                        >
                            <input maxLength={200} />
                        </Form.Item>
                        <span className="inputCounter">{imageDescCount}/200</span>
                    </div>
                </div>
                
                <Button className="saveButton" htmlType="submit">
                    {factToEdit ? 'Оновити' : 'Зберегти'}
                </Button>
            </Form>
        </Modal>
    );
};

export default observer(InterestingFactsModal);