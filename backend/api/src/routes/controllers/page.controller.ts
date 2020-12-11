import ApiConfig from '../../api.config'
import { Request, Response, NextFunction } from 'express'
import Axios, { AxiosResponse } from 'axios'
import { ICategory, IUser } from 'vidijo-lib/lib/interfaces'

class PageController {
  // Get aggregated data for the discover page
  public async getHomePage(req: Request, res: Response, next: NextFunction) {
    // Home page requested, but no one is logged in -> empty home page
    if (!req.user) {
      return res.status(200).json({})
    }

    const DAYS_BACK: number = 7
    const dateLastWeek: Date = new Date(new Date().getTime())
    dateLastWeek.setDate(new Date().getDate() - DAYS_BACK)

    const [
      recentlyUpdatedFavoriteJournalsResponse,
      lastReadingListArticlesResponse,
      favoriteJournalsResponse,
    ]: any = await Promise.all([
      Axios.get(
        `${ApiConfig.API_URI}/v1/users/${
          (req.user as IUser)._id
        }/favoriteJournals?latestPubdate=>${dateLastWeek}&sort=-latestPubdate&select=title cover`
      ),
      Axios.get(
        `${ApiConfig.API_URI}/v1/users/${
          (req.user as IUser)._id
        }/readingList?limit=5&populate=publishedIn&populateSelect=cover title&select=title authors pubdate doi`
      ),
      Axios.get(
        `${ApiConfig.API_URI}/v1/users/${
          (req.user as IUser)._id
        }/favoriteJournals?limit=10&select=title cover&sort=+title`
      ),
    ]).catch((err) => {
      return next(err)
    })

    // Newest articles
    const newestArticlesPromises: Promise<AxiosResponse<any>>[] = []
    for (let recentlyUpdatedFavoriteJournal of recentlyUpdatedFavoriteJournalsResponse
      .data.docs) {
      const promise = Axios.get(
        `${ApiConfig.API_URI}/v1/articles?publishedIn=${recentlyUpdatedFavoriteJournal._id}&sort=-pubdate&limit=3&select=title authors pubdate abstract`
      )
      newestArticlesPromises.push(promise)
    }

    const newestArticlesResponses: any[] | void = await Promise.all(
      newestArticlesPromises
    ).catch((err) => {
      return next(err)
    })

    if (!newestArticlesResponses) {
      return next(new Error('newestArticlesResponses is void'))
    }

    let i = 0
    for (let recentlyUpdatedFavoriteJournal of recentlyUpdatedFavoriteJournalsResponse
      .data.docs) {
      recentlyUpdatedFavoriteJournal.newestArticles =
        newestArticlesResponses[i++].data.docs
    }

    // Aggregate data
    const homePageData: any = {
      recentlyUpdatedFavoriteJournals:
        recentlyUpdatedFavoriteJournalsResponse.data.docs,
      lastReadingListArticles: lastReadingListArticlesResponse.data.docs,
      favoriteJournals: favoriteJournalsResponse.data.docs,
    }

    return res.status(200).json(homePageData)
  }

  // Get aggregated data for the discover page
  public async getDiscoverPage(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const DAYS_BACK: number = 7
    const dateLastWeek: Date = new Date(new Date().getTime())
    dateLastWeek.setDate(new Date().getDate() - DAYS_BACK)

    const [
      recentlyUpdatedJournalsResponse,
      topCategoriesResponse,
      recentlyAddedJournalsResponse,
      mostViewedJournalsResponse,
    ]: any = await Promise.all([
      Axios.get(
        `${ApiConfig.API_URI}/v1/journals?latestPubdate=>${dateLastWeek}&sort=-latestPubdate&limit=10&select=title cover`
      ),
      Axios.get(
        `${ApiConfig.API_URI}/v1/categories?display=true&select=title color&sort=+title`
      ),
      Axios.get(
        `${ApiConfig.API_URI}/v1/journals?sort=-added&limit=10&select=title cover`
      ),
      Axios.get(
        `${ApiConfig.API_URI}/v1/journals?sort=-views&limit=10&select=title cover`
      ),
    ]).catch((err) => {
      return next(err)
    })

    // Newest articles
    const newestArticlesPromises: Promise<AxiosResponse<any>>[] = []
    for (let recentlyUpdatedJournal of recentlyUpdatedJournalsResponse.data
      .docs) {
      const promise = Axios.get(
        `${ApiConfig.API_URI}/v1/articles?publishedIn=${recentlyUpdatedJournal._id}&sort=-pubdate&limit=3&select=title authors pubdate abstract`
      )
      newestArticlesPromises.push(promise)
    }

    const newestArticlesResponses: any[] | void = await Promise.all(
      newestArticlesPromises
    ).catch((err) => {
      return next(err)
    })

    if (!newestArticlesResponses) {
      return next(new Error('newestArticlesResponses is void'))
    }

    let i = 0
    for (let recentlyUpdatedJournal of recentlyUpdatedJournalsResponse.data
      .docs) {
      recentlyUpdatedJournal.newestArticles =
        newestArticlesResponses[i++].data.docs
    }

    // Aggregate data
    const discoverPageData: any = {
      recentlyUpdatedJournals: recentlyUpdatedJournalsResponse.data.docs,
      topCategories: topCategoriesResponse.data.docs,
      recentlyAddedJournals: recentlyAddedJournalsResponse.data.docs,
      mostViewedJournals: mostViewedJournalsResponse.data.docs,
    }

    return res.status(200).json(discoverPageData)
  }

  // Get aggregated data for the journals page
  public async getJournalsPage(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    // Special categories: all journals & favorite journals (only if logged in)
    let specialAvailableCategories: ICategory[] = []
    specialAvailableCategories.push({
      _id: 'all',
      title: 'All Journals',
    } as ICategory)
    if (req.user) {
      specialAvailableCategories.push({
        _id: 'favorites',
        title: 'Favorite Journals',
      } as ICategory)
    }

    // Sort
    const possibleSortValues: string[] = [
      '+title',
      '-latestPubdate',
      '-added',
      '-views',
    ]
    const sort: string =
      possibleSortValues.indexOf(req.query.sort as string) >= 0
        ? (req.query.sort as string)
        : '+title'

    let requests: Promise<any>[] = [
      // 1. Available categories
      Axios.get(`${ApiConfig.API_URI}/v1/categories?display=true&select=title`),
      // 2. Current category
      // -> Appended in switch
      // 3. Journals
      // -> Appended in switch
    ]

    // Limit
    const limit: number = 20

    // Category
    const category = req.query.category ? req.query.category : 'all'
    switch (category) {
      case '':
      case 'all': {
        // Current category
        requests.push(
          new Promise((resolve, reject) => {
            return resolve({
              data: {
                _id: 'all',
                title: 'All Journals',
                color: '#ffffff',
              } as ICategory,
            })
          })
        )
        // Journals
        requests.push(
          Axios.get(
            `${ApiConfig.API_URI}/v1/journals?sort=${sort}&limit=${limit}&select=title cover`
          )
        )
        break
      }

      case 'favorites': {
        // Current category
        requests.push(
          new Promise((resolve, reject) => {
            return resolve({
              data: {
                _id: 'favorites',
                title: 'Favorite Journals',
                color: '#ffffff',
              } as ICategory,
            })
          })
        )
        // Journals
        requests.push(
          Axios.get(
            `${ApiConfig.API_URI}/v1/users/${
              (req.user as IUser)._id
            }/favoriteJournals?sort=${sort}&limit=${limit}&select=title cover`,
            { withCredentials: true }
          )
        )
        break
      }

      default: {
        // Current category
        requests.push(
          Axios.get(`${ApiConfig.API_URI}/v1/categories/${category}`)
        )
        // Journals
        requests.push(
          Axios.get(
            `${ApiConfig.API_URI}/v1/journals?categories[]=${category}&sort=${sort}&limit=${limit}&select=title cover`
          )
        )
        break
      }
    }

    // Get all journals
    const [
      availableCategories,
      categoryResponse,
      journalsResponse,
    ]: any[] = await Promise.all(requests)

    // Aggregate data
    const journalsPageData: any = {
      availableCategories: specialAvailableCategories.concat(
        availableCategories.data.docs
      ),
      category: categoryResponse.data,
      sort: sort,
      journals: journalsResponse.data.docs,
    }

    return res.status(200).json(journalsPageData)
  }

  // Get aggregated data for the categories page
  public async getCategoriesPage(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const [categoriesResultsResponse]: any = await Promise.all([
      Axios.get(
        `${ApiConfig.API_URI}/v1/categories?select=title color&sort=+title`
      ),
    ]).catch((err) => {
      return next(err)
    })

    // Aggregate data
    const categoriesPageData: any = {
      categories: categoriesResultsResponse.data.docs,
    }

    return res.status(200).json(categoriesPageData)
  }

  // Get aggregated data for the search page
  public async getSearchPage(req: Request, res: Response, next: NextFunction) {
    const searchQuery: string = req.query.q as string

    const [
      categoriesResultsResponse,
      journalsResultsResponse,
      articlesResultsResponse,
    ]: any = await Promise.all([
      Axios.get(
        `${ApiConfig.API_URI}/v1/categories?search=${searchQuery}&limit=15&sort=+title&select=title color`
      ),
      Axios.get(
        `${ApiConfig.API_URI}/v1/journals?search=${searchQuery}&limit=15&sort=+title&select=title cover issn eissn`
      ),
      Axios.get(
        `${ApiConfig.API_URI}/v1/articles?search=${searchQuery}&populate=publishedIn&populateSelect=cover title&sort=-pubdate&limit=15&select=title authors pubdate publishedIn doi`
      ),
    ]).catch((err) => {
      return next(err)
    })

    // Aggregate data
    const searchPageData: any = {
      categories: categoriesResultsResponse.data.docs,
      journals: journalsResultsResponse.data.docs,
      articles: articlesResultsResponse.data.docs,
    }

    return res.status(200).json(searchPageData)
  }
}

export default new PageController()
