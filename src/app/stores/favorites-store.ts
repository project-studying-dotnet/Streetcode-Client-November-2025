import { makeAutoObservable } from 'mobx';

export default class FavoritesStore {
    private static storageKey = 'streetcode_favorites';
    public favoriteIds: Set<number> = new Set();

    public constructor() {
        makeAutoObservable(this);
        this.loadFromLocalStorage();
    }

    private loadFromLocalStorage = () => {
        const stored = localStorage.getItem(FavoritesStore.storageKey);
        if (stored) {
            this.favoriteIds = new Set(JSON.parse(stored));
        }
    };

    private saveToLocalStorage = () => {
        localStorage.setItem(
            FavoritesStore.storageKey,
            JSON.stringify(Array.from(this.favoriteIds))
        );
    };

    public addFavorite = (streetcodeId: number) => {
        this.favoriteIds.add(streetcodeId);
        this.saveToLocalStorage();
    };

    public removeFavorite = (streetcodeId: number) => {
        this.favoriteIds.delete(streetcodeId);
        this.saveToLocalStorage();
    };

    public toggleFavorite = (streetcodeId: number) => {
        if (this.isFavorite(streetcodeId)) {
            this.removeFavorite(streetcodeId);
        } else {
            this.addFavorite(streetcodeId);
        }
    };

    public isFavorite = (streetcodeId: number): boolean => {
        return this.favoriteIds.has(streetcodeId);
    };

    get favoritesCount() {
        return this.favoriteIds.size;
    }

    get favoritesList() {
        return Array.from(this.favoriteIds);
    }
}