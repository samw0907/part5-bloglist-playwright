const { test, describe, expect, beforeEach } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Michael Scott',
        username: 'mscott',
        password: 'dundermiflin'
      }
    })

    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Dwight Schrute',
        username: 'dschrute',
        password: 'ihatejim',
      },
    })

    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    const locator = await page.getByText('log in to application')
    await expect(locator).toBeVisible()
    await expect(page.getByText('log in to application')).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByTestId('username').first().fill('mscott')
      await page.getByTestId('password').last().fill('dundermiflin')

      await page.getByRole('button', { name: 'login' }).click()
  
      await expect(page.getByText('Michael Scott is logged in')).toBeVisible()
    })

    test('fails with incorrect credentials', async ({ page }) => {
      await page.getByTestId('username').first().fill('mscott')
      await page.getByTestId('password').last().fill('wrongpassword')
      await page.getByRole('button', { name: 'login' }).click()
  
      const errorDiv = await page.locator('.error')
      await expect(errorDiv).toContainText('Wrong credentials')
      await expect(page.getByText('Michael Scott is logged in')).not.toBeVisible()
    })
  })

describe('When logged in', () => {
  beforeEach(async ({ page }) => {
    await page.getByTestId('username').first().fill('mscott')
    await page.getByTestId('password').last().fill('dundermiflin')
    await page.getByRole('button', { name: 'login' }).click()
    await expect(page.getByText('Michael Scott is logged in')).toBeVisible()

    await page.getByRole('button', { name: 'create new' }).click()
    await page.getByTestId('title').fill('How to sell paper')
    await page.getByTestId('author').fill('Michael Scott')
    await page.getByTestId('url').fill('http://myblogs.com')
    await page.getByRole('button', { name: 'Save' }).click()
  })

  test('a new blog can be created', async ({ page }) => {
    await expect(page.getByText('How to sell paper - Michael Scott')).toBeVisible()
  })

  test('a blog can be liked', async ({ page }) => {
    await page.getByRole('button', { name: 'view' }).click()
    await page.getByRole('button', { name: 'like' }).click()
    await expect(page.getByText('Likes: 1')).toBeVisible()
  })

  test('the user who created a blog can delete the blog', async ({ page }) => {
    await expect(page.getByText('Michael Scott is logged in')).toBeVisible()

    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm')
      expect(dialog.message()).toBe('Are you sure you want to delete this blog?')
      await dialog.accept()

      await page.getByRole('button', { name: 'remove' }).click()
      await expect(page.getByText('How to sell paper - Michael Scott')).not.toBeVisible()
    })

  })

  test('only the user who created a blog can see the remove button', async ({ page }) => {
    await page.getByRole('button', { name: 'create new' }).click()
    await page.getByTestId('title').fill('How to sell paper')
    await page.getByTestId('author').fill('Michael Scott')
    await page.getByTestId('url').fill('http://myblogs.com')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('How to sell paper - Michael Scott')).toBeVisible()

    await page.getByRole('button', { name: 'view' }).click()
    await page.getByRole('button', { name: 'like' }).click()

    await expect(page.getByRole('button', { name: 'remove' })).toBeVisible()

    await page.getByRole('button', { name: 'logout' }).click()
    await expect(page.getByText('log in to application')).toBeVisible()


    await page.getByTestId('username').first().fill('dschrute')
    await page.getByTestId('password').last().fill('ihatejim')
    await page.getByRole('button', { name: 'login' }).click()
    await expect(page.getByText('Dwight Schrute is logged in')).toBeVisible()

    await page.getByRole('button', { name: 'view' }).first().click()
    await expect(page.getByRole('button', { name: 'remove' })).not.toBeVisible()
  })

  test('blogs are sorted by likes in descending order', async ({ page }) => {

    await page.getByRole('button', { name: 'create new' }).click()
    await page.getByTestId('title').fill('My 100 funniest jokes')
    await page.getByTestId('author').fill('Michael Scott')
    await page.getByTestId('url').fill('http://myjokes.com')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('My 100 funniest jokes - Michael Scott')).toBeVisible()

    await page.getByRole('button', { name: 'view' }).first().click()
    await page.getByRole('button', { name: 'like' }).first().click()
    await page.waitForTimeout(500)
    await expect(page.getByText('Likes: 1')).toBeVisible()

    await page.getByRole('button', { name: 'view' }).last().click()
    await page.getByRole('button', { name: 'like' }).last().click()
    await page.waitForTimeout(500)
    await page.getByRole('button', { name: 'like' }).last().click()
    await page.waitForTimeout(500)
    await expect(page.getByText('Likes: 2')).toBeVisible()


    const blogTitles = await page.$$eval('.blog-title-author', blogs =>
      blogs.map(blog => blog.textContent))

    expect(blogTitles[0]).toContain('My 100 funniest jokes - Michael Scott')
    expect(blogTitles[1]).toContain('How to sell paper - Michael Scott')
  })
 })
})