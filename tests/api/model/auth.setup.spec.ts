import {expect, test as setup} from '@playwright/test'
import dotenv from "dotenv";
dotenv.config();

// setup('Auth', async({request})=>{
//     const response = await request.post(
//         'https://www.kaggle.com/api/i/users.LegacyUsersService/EmailSignIn',
//         {
//             data: {
//                 "email": process.env.EMAIL,
//                 "password": process.env.PASSWORD,
//                 "returnUrl": "/"
//             }
//         }
//     );
//     const json = await response.json();
//     console.log(response);
//     console.log('-------------------------------------');
//     console.log(json);
//     const token = json['data'];
//     expect(token, json.errors ? json.errors[0].message : '').not.toBeFalsy();
    // await context.addCookies([{ name: 'JWToken', value: token, url: process.env.VER_BASE_URL }]);
    // await context.storageState({ path: './src/auth/defaultStorageState.json' });
//})

setup ('Autn via UI', async({page,context})=>{
    await page.goto('/');
    await page.getByRole('button',{name:'Sign in'}).click();
    await page.getByRole('button',{name:'Sign in with Email'}).click();
    await page.locator('input[name="email"]').fill(`${process.env.EMAIL}`);
    await page.locator('input[name="password"]').fill(`${process.env.PASSWORD}`);
    await page.getByRole('button',{name:'Sign In'}).click();
    await expect(page.getByTestId('home-page-logged-in-render-tid')).toBeVisible()
    await page.context().storageState({ path: './defaultStorageState.json' });

})