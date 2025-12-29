/* eslint-disable max-len */
import './StreetcodeCatalogItem.styles.scss';

import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import useMobx from '@stores/root-store';

import useOnScreen from '@/app/common/hooks/scrolling/useOnScreen.hook';
import { useAsync } from '@/app/common/hooks/stateful/useAsync.hook';
import useWindowSize from '@/app/common/hooks/stateful/useWindowSize.hook';
import base64ToUrl from '@/app/common/utils/base64ToUrl.utility';
import { StreetcodeCatalogRecord } from '@/models/streetcode/streetcode-types.model';
import { toStreetcodeRedirectClickEvent } from '@/app/common/utils/googleAnalytics.unility';

interface Props {
    streetcode: StreetcodeCatalogRecord;
    isLast: boolean;
    handleNextScreen: () => void;
}

const StreetcodeCatalogItem = ({ streetcode, isLast, handleNextScreen }: Props) => {
    const { imagesStore: { getImage, fetchImage }, favoritesStore } = useMobx();
    const elementRef = useRef<HTMLDivElement>(null);
    const classSelector = 'catalogItem';
    const isOnScreen = useOnScreen(elementRef, classSelector);

    useEffect(() => (isOnScreen && isLast ? () => handleNextScreen() : () => { }), [isOnScreen]);

    useEffect(() => {
        Promise.all([fetchImage(streetcode.imageId)]);
    }, []);

    const LinkProps = {
        className: classSelector,
        style: { backgroundImage: `url(${base64ToUrl(getImage(streetcode.imageId)?.base64, getImage(streetcode.imageId)?.mimeType)})` },
        to: `../${streetcode.url}`,
    }
    const windowsize = useWindowSize();

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        favoritesStore.toggleFavorite(streetcode.id);
    };

    const isFavorited = favoritesStore.isFavorite(streetcode.id);

    return (
        <>
            {windowsize.width > 1024 && (
                <div style={{ position: 'relative' }}>
                    <Link {...LinkProps} onClick={() => toStreetcodeRedirectClickEvent(streetcode.url, 'catalog')}>
                        <div ref={elementRef} className="catalogItemText">
                            <div className="heading">
                                <p>{streetcode.title}</p>
                                {
                                    streetcode.alias !== null ? (
                                        <p className="aliasText">
                                            ({streetcode.alias})
                                        </p>
                                    ) : undefined
                                }
                            </div>
                        </div>
                    </Link>
                    <button
                        onClick={handleFavoriteClick}
                        aria-label={isFavorited ? 'Видалити з улюбленого' : 'Додати в улюблене'}
                        className="favoriteButton"
                    >
                        {isFavorited ? <HeartFilled style={{ color: '#C12828' }} /> : <HeartOutlined style={{ color: '#666' }} />}
                    </button>
                </div>
            )}
            {windowsize.width <= 1024 && (
                <div style={{ position: 'relative' }}>
                    <Link {...LinkProps} />
                    <div ref={elementRef} className="catalogItemText mobile">
                        <div className="heading">
                            <p>{streetcode.title}</p>
                            {
                                streetcode.alias !== null ? (
                                    <p className="aliasText">
                                        ({streetcode.alias})
                                    </p>
                                ) : undefined
                            }
                        </div>
                    </div>
                    <button
                        onClick={handleFavoriteClick}
                        aria-label={isFavorited ? 'Видалити з улюбленого' : 'Додати в улюблене'}
                        className="favoriteButton mobile"
                    >
                        {isFavorited ? <HeartFilled style={{ color: '#C12828' }} /> : <HeartOutlined style={{ color: '#666' }} />}
                    </button>
                </div>
            )}
        </>
    );
};

export default observer(StreetcodeCatalogItem);
