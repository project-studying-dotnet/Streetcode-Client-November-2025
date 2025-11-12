import './SupportUs.styles.scss';
import Title from './Title/Title.component';
import MainBlock from './MainBlock/MainBlock.component';

const SupportPage = () => (
    <>
        <div className="supportUsContainer">
            <div className="wrapper">
                <Title />
                <MainBlock />
            </div>
        </div>
    </>
);

export default SupportPage;
