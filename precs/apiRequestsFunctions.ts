import { Page } from '@playwright/test';


async function setHeaders(page: Page) {
    const cookies = await page.context().cookies()
    let xsrfToken
    for(let e of cookies) {
        if (e.name === 'XSRF-TOKEN')  xsrfToken = e.value
    }
    return {
        'X-Xsrf-Token':`${xsrfToken}`
    };
}

export async function post(page: Page, url: string, payload?: JSON | string) {
    return page.request.post(url, {
        headers: await setHeaders(page),
        data: payload
    });
}

/**
 * Perform a PUT request to a given URL with custom headers and payload data.
 *
 * @param {Page} page - PW page object.
 * @param {string} url - The URL to send the PUT request to.
 * @param {JSON | string} payload - The data to be included in the PUT request payload.
 * @returns {Promise<APIResponse>} - A Promise that resolves to the HTTP response from the PUT request.
 */
export async function put(page: Page, url: string, payload: JSON | string) {
    return page.request.put(url, {
        headers: await setHeaders(page),
        data: payload
    });
}

/**
 * Perform a GET request to a given URL.
 *
 * @param {Page} page - PW page object.
 * @param {string} url - The URL to send the GET request to.
 * @returns {Promise<APIResponse>} - A Promise that resolves to the HTTP response from the GET request.
 */
export async function get(page: Page, url: string, params?) {
    return page.request.get(url, {
        headers: await setHeaders(page),
        params: params
    });
}