import { Locator, expect} from "@playwright/test";
import { BaseBusinessObjectPage } from "./BaseBusinessObjectPage";

export class YourWork extends BaseBusinessObjectPage{
    agreementCheckbox: Locator
    cancelBtnOnPanel: Locator
    continueBtnOnPanel: Locator
    deleteBtn: Locator
    deleteBtnOnConfirmDialog: Locator
    itemOnConfirmationDialog: Locator
    listItem: Locator
    searchField: Locator
    //upvoteBtn: Locator
    

    constructor(page){
        super(page)
        this.agreementCheckbox = page.locator('.drawer-outer-container input')
        this.cancelBtnOnPanel = page.locator('.drawer-outer-container button').getByText('Cancel')
        this.continueBtnOnPanel = page.locator('.drawer-outer-container button').getByText('Continue')
        this.deleteBtn = page.getByTitle('Delete selected items')
        this.deleteBtnOnConfirmDialog = page.getByRole('dialog').getByRole('button').getByText('Delete')
        this.listItem = page.locator('#site-content ul li')
        this.itemOnConfirmationDialog = page.locator('.drawer-outer-container ul li a')
        this.searchField = page.getByPlaceholder('Search Your Work')
        //this.upvoteBtn = page.getByTestId('upvotebutton__upvote')
    }
    
    public async checkAgreementCheckbox(){
        await this.agreementCheckbox.check()
    }


    public async checkAllItemsContainingNameAndReturnTheirNames(name:string){
        await this.page.waitForTimeout(7000);
        await this.page.reload();
        await this.page.waitForTimeout(1000);
        const items = await this.listItem.filter({hasText:`${name}`}).all();
        let checkedItemsNames:Array<string|null> = []
        for(let title of items){
            await title.locator('[type="checkbox"]').check();
            checkedItemsNames.push(await title.locator('a').first().getAttribute('aria-label'))
        }
        return checkedItemsNames
    }

    public async checkItemsWithProvidedNamesAndReturnTheirNames(names:string[]){
        await this.page.waitForTimeout(7000);
        await this.page.reload();
        await this.page.waitForTimeout(1000);
        let itemsToCheck:Array<Locator> = []
        for(let name of names){
            if (await this.listItem.filter({hasText:`${name}`}).isVisible()){
            itemsToCheck.push(this.listItem.filter({hasText:`${name}`}));
            } else itemsToCheck
        }
        let checkedItemsNames:Array<string|null> = []
        for(let item of itemsToCheck){
            await item.locator('[type="checkbox"]').check();
            checkedItemsNames.push(await item.locator('a').first().getAttribute('aria-label'))
        }
        return checkedItemsNames
    }

    public async checkItemsWithProvidedNamesAndReturnTheirNamesWithoutTimeout(names:string[]){
        let itemsToCheck:Array<Locator> = []
        for(let name of names){
            if (await this.listItem.filter({hasText:`${name}`}).isVisible()){
            itemsToCheck.push(this.listItem.filter({hasText:`${name}`}));
            } else itemsToCheck
        }
        let checkedItemsNames:Array<string|null> = []
        for(let item of itemsToCheck){
            await item.locator('[type="checkbox"]').check();
            checkedItemsNames.push(await item.locator('a').first().getAttribute('aria-label'))
        }
        return checkedItemsNames
    }

    public async clickContinueBtnOnPanel(){
        await this.continueBtnOnPanel.click()
    }

    public async clickCancelBtnOnPanel(){
        await this.cancelBtnOnPanel.click()
    }

    public async clickDeleteBtn(){
        await this.deleteBtn.click()
    }

    public async clickDeleteBtnOnConfirmDialog(){
        await this.deleteBtnOnConfirmDialog.click()
    }

    /**
     * 
     * @param itemName - can be model title or subtitle
     */
    public async clickListItem(itemName:string){
        await this.listItem.filter({hasText:itemName}).click()
    }

    public async clickUpvoteBtnForListItem(listItem:Locator){
        await listItem.getByTestId('upvotebutton__upvote').click()
    }

    public async getCheckedItemsNames(){
        const items = await this.listItem.filter({has:this.page.getByTestId('CheckBoxIcon')}).all();
        let checkedItemsNames: Array<string|null> = []
        for (let item of items){
            checkedItemsNames.push(await item.locator('a').first().getAttribute('aria-label'))
        }
        return checkedItemsNames
    }

    public async getConfirmationPopUpText(){
        const text = await this.page.getByRole('dialog').locator('p').innerText();
        return text
    }

    public async getCountOfItemsOnTab(tabName:string){
        const regexPattern = new RegExp(`Your ${tabName} \\(\\d{1,}\\)`);
        const element = await this.page.getByText(regexPattern).innerText();
        const label:string = element ?? 'not found';
        const match = label.match(/\d+/);
        if (match) return +match[0]
        //     {
        // const number = match[0];
        // return +number; // to convert string to number
        // } else {
        //  throw new Error(`No number found in label: ${label}`);
        // }
    }

    public async getCountOfItemsOnDeleteWarningPanel(){
        const stringOnPanel = await this.page.locator('.drawer-outer-container p').first().innerText();
        const stringArray = stringOnPanel.split(' ');
        return parseInt(stringArray[8])
    }

    public async getCountOfUpvotesForListItem(listItem:Locator){
        const count = listItem.locator('//button/following-sibling::span[@mode]').innerText()
        return +count
    }

    public async getListItemByNameOrSubtitle(itemNameOrSubtitle:string):Promise<Locator>{
        await this.page.waitForTimeout(500)
        return this.listItem.filter({hasText:itemNameOrSubtitle})
    }

    public async getListItemSubtitle(listItem:Locator){
        await this.page.waitForTimeout(500)
        return await listItem.locator('a span').first().innerText()
    }

    public async getListItemDetailsModel(listItem:Locator): Promise<{ visibility: string, owner: string, countVariations: string, countNotebooks: string}>{
        await this.page.waitForTimeout(500);
        const details = await listItem.locator('a span').nth(1).allInnerTexts();
        const detailsArray = details[0].split(' · ');
        detailsArray[0]!=='Private'?detailsArray.unshift('Public'):detailsArray
        return {visibility: detailsArray[0], owner: detailsArray[1], countVariations: detailsArray[2], countNotebooks: detailsArray[3]}
    }

    public async getNamesOfItemsOnDeleteWarningPanel(){
        const arrayOfLocators = await this.itemOnConfirmationDialog.all();
        let arrayOfNames:Array<string|null> = []
        for (let locator of arrayOfLocators){
            arrayOfNames.push(await locator.getAttribute('aria-label'))
        }
        return arrayOfNames
    }

    public async getNamesOfUpvotedItems(){
        await this.page.waitForTimeout(500)
        const arrayOfLocators = await this.listItem.filter({has:this.page.locator('button[mode="selected"]')}).all();
        let arrayOfNames:Array<string|null> = []
        for (let locator of arrayOfLocators){
            arrayOfNames.push(await locator.locator('a').getAttribute('aria-label'))
        }
        return arrayOfNames
    }

    public async isListItemUpvoted(listItem:Locator){
        const mode = await listItem.getByTestId('upvotebutton__upvote').getAttribute('mode')
        return mode==='selected'
    }
    public async getUpvotesCountForListItem(listItem:Locator){
        await this.page.waitForTimeout(500);
        const count = await listItem.locator('span[mode="default"]').innerText()
        return +count
    }

    public async searchYourWork(searchString:string){
        await this.page.waitForTimeout(1500)
        await this.searchField.fill(searchString)
    }

    public async uncheckItemsWithProvidedNamesAndReturnTheirNames(names:string[]){
        let itemsToUncheck:Array<Locator> = []
        for(let name of names){
            itemsToUncheck.push(this.listItem.filter({hasText:`${name}`}));
        }
        let uncheckedItemsNames:Array<string|null> = []
        for(let item of itemsToUncheck){
            await item.locator('[type="checkbox"]').uncheck();
            uncheckedItemsNames.push(await item.locator('a').first().getAttribute('aria-label'))
        }
        return uncheckedItemsNames
    }
}