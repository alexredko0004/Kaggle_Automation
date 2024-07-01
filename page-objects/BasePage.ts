import {Page, Locator} from '@playwright/test'

export abstract class BasePage{
    page: Page
    flashMessage: Locator

    constructor(page){
        this.page = page
        this.flashMessage = page.getByRole('alert')
    }

    public getFlashMessageLocator():Locator{
        return this.flashMessage
    }

    public async getFlashMessageText(){
        return this.flashMessage.innerText()
    }

    public getLocatorByText(text:string):Locator{
        return this.page.getByText(text)
     }
}