import {Page, Locator} from '@playwright/test'

export abstract class BasePage{
    page: Page
    confirmationDialog: Locator
    flashMessage: Locator
    tooltip: Locator

    constructor(page){
        this.page = page
        this.confirmationDialog = page.getByRole('dialog')
        this.flashMessage = page.getByRole('alert')
        this.tooltip = page.locator('.rmwc-tooltip').getByRole('tooltip')
    }
    
    public async clickBtnOnConfirmationDialog(btnName:string){
        await this.confirmationDialog.locator('button',{has:this.page.getByText(btnName)}).click()
    }

    public async getConfirmationPopupHeaderInnerText(){
        const innerText = await this.confirmationDialog.locator('h2').innerText();
        return innerText
    }

    public async getConfirmationPopupInnerText(){
        const innerText = await this.confirmationDialog.locator('//h2/following-sibling::div/p').innerText();
        return innerText
    }

    public getFlashMessageLocator():Locator{    //USAGE OF THIS??
        return this.flashMessage
    }

    public async getFlashMessageText(){
        await this.flashMessage.isVisible();
        return this.flashMessage.innerText()
    }

    public getLocatorByText(text:string):Locator{
        return this.page.getByText(text)
    }

    public async getPageURLAfterRedirect(){
        await this.page.waitForTimeout(500);
        const url = this.page.url();
        return url
    }

    public getTooltipLocator():Locator{
        return this.tooltip
    }

    public async getTooltipText(){
        await this.tooltip.isVisible();
        return this.tooltip.innerText()
    }

    public async isConfirmationPopupShown(){
        return await this.confirmationDialog.isVisible()
    }
}