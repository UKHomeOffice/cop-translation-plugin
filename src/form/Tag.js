export default class Tag {

    constructor(component) {
        this.tags = component.tags
    }

    isEncrypted() {
        return this.tags && this.tags.find(t => t === 'encrypted')
    }

    isImage() {
        return this.tags && this.tags.find(t => t === 'image')
    }
}
