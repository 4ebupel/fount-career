export const navigationLock = {
    isNavigating: false,
    lock() {
        this.isNavigating = true;
    },
    unlock() {
        this.isNavigating = false;
    },
};