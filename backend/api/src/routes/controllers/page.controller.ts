import ApiConfig from '../../api.config'
import { Request, Response, NextFunction } from 'express'
import Axios from 'axios'
import { IArticle, ICategory, IJournal, IUser } from 'vidijo-lib/lib/interfaces'
import { Logger } from 'vidijo-lib'

interface HomePageData {
  recentlyUpdatedFavoriteJournals: any[]
  lastReadingListArticles: IArticle[]
  favoriteJournals: IJournal[]
}

/**
 * Return the data for the home page of the currently logged in user
 *
 * @param req
 * @param res
 * @param next
 */
export function getHomePage(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.json({})

  const user: IUser = req.user as IUser

  Promise.resolve({} as HomePageData)
    .then((homePageData) => homePageGetFavoriteJournals(homePageData, user))
    .then((homePageData) => homePageGetReadingList(homePageData, user))
    .then((homePageData) => homePageGetNewestArticles(homePageData, user))
    .then((homePageData) => res.json(homePageData))
    .catch(next)
}

async function homePageGetFavoriteJournals(
  homePageData: HomePageData,
  user: IUser
): Promise<HomePageData> {
  // Build the ID query string for mongo-querystring (all journals with IDs $in array of favoriteJournals)
  // Outputs something like this: _id[]=1234&_id[]=5678 (journal 1234 and 5678 are favorites)
  if (!user) throw Error(`Requested favorite journals, but no one is logged in`)

  if (!user.favoriteJournals.length) {
    homePageData.favoriteJournals = []
    return homePageData
  }

  const idQuery: string = (user.favoriteJournals as string[]).reduce(
    (acc, id) => `${acc ? `${acc}&` : acc}_id[]=${id}`,
    ''
  )

  const favoriteJournalsResponse = await Axios.get(
    `${ApiConfig.API_URI}/v1/journals?${idQuery}&sort=+title&limit=10`
  )

  homePageData.favoriteJournals = favoriteJournalsResponse.data.docs
  return homePageData
}

async function homePageGetReadingList(
  homePageData: HomePageData,
  user: IUser
): Promise<HomePageData> {
  const idQuery: string = (user.readingList as string[]).reduce(
    (acc, id) => `${acc ? `${acc}&` : acc}_id[]=${id}`,
    ''
  )

  if (!user.readingList.length) {
    homePageData.lastReadingListArticles = []
    return homePageData
  }

  const readingListResponse = await Axios.get(
    `${ApiConfig.API_URI}/v1/articles?${idQuery}&limit=5&populate=publishedIn&populateSelect=title useGeneratedCover`
  )

  homePageData.lastReadingListArticles = readingListResponse.data.docs
  return homePageData
}

async function homePageGetNewestArticles(
  homePageData: HomePageData,
  user: IUser
): Promise<HomePageData> {
  if (!user.favoriteJournals.length) {
    homePageData.recentlyUpdatedFavoriteJournals = []
    return homePageData
  }

  const DAYS_BACK: number = 7
  const dateLastWeek: Date = new Date(new Date().getTime())
  dateLastWeek.setDate(new Date().getDate() - DAYS_BACK)

  homePageData.recentlyUpdatedFavoriteJournals = []

  const idQuery: string = (user.favoriteJournals as string[]).reduce(
    (acc, id) => `${acc ? `${acc}&` : acc}_id[]=${id}`,
    ''
  )

  return Promise.resolve(homePageData).then(async (homePageData) => {
    const newestFavorites: IJournal[] = await Axios.get(
      `${ApiConfig.API_URI}/v1/journals?${idQuery}&sort=-latestPubdate&latestPubdate=>${dateLastWeek}&limit=10`
    ).then((response) => response.data.docs)

    for (let favorite of newestFavorites) {
      const newestArticles: IArticle[] = await Axios.get(
        `${ApiConfig.API_URI}/v1/articles?publishedIn=${favorite._id}&limit=3&sort=-pubdate&pubdate=>${dateLastWeek}`
      ).then((response) => response.data.docs)

      homePageData.recentlyUpdatedFavoriteJournals.push({
        ...favorite,
        newestArticles: newestArticles,
      })
    }

    return homePageData
  })
}

interface DiscoverPageData {
  recentlyUpdatedJournals: any[]
  topCategories: ICategory[]
  recentlyAddedJournals: IJournal[]
  mostViewedJournals: IJournal[]
}

/**
 * Returns the data for displaying the discover page
 *
 * @param req
 * @param res
 * @param next
 */
export function getDiscoverPage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  Promise.resolve({} as DiscoverPageData)
    .then(discoverPageGetNewestArticles)
    .then(discoverPageGetTopCategories)
    .then(discoverPageGetRecentlyAddedJournals)
    .then(discoverPageGetMostViewedJournals)
    .then((discoverPageData) => res.json(discoverPageData))
    .catch(next)
}

async function discoverPageGetNewestArticles(
  discoverPageData: DiscoverPageData
): Promise<DiscoverPageData> {
  const DAYS_BACK: number = 7
  const dateLastWeek: Date = new Date(new Date().getTime())
  dateLastWeek.setDate(new Date().getDate() - DAYS_BACK)

  discoverPageData.recentlyUpdatedJournals = []

  return Promise.resolve(discoverPageData).then(async (discoverPageData) => {
    const newestJournals: IJournal[] = await Axios.get(
      `${ApiConfig.API_URI}/v1/journals?sort=-latestPubdate&latestPubdate=>${dateLastWeek}&limit=10`
    ).then((response) => response.data.docs)

    for (let journal of newestJournals) {
      const newestArticles: IArticle[] = await Axios.get(
        `${ApiConfig.API_URI}/v1/articles?publishedIn=${journal._id}&limit=3&sort=-pubdate&pubdate=>${dateLastWeek}`
      ).then((response) => response.data.docs)

      discoverPageData.recentlyUpdatedJournals.push({
        ...journal,
        newestArticles: newestArticles,
      })
    }

    return discoverPageData
  })
}

async function discoverPageGetTopCategories(
  discoverPageData: DiscoverPageData
): Promise<DiscoverPageData> {
  const topCategories = await Axios.get(
    `${ApiConfig.API_URI}/v1/categories?display=true&select=title color&sort=+title`
  ).then((response) => response.data.docs)

  discoverPageData.topCategories = topCategories ?? []
  return discoverPageData
}

async function discoverPageGetRecentlyAddedJournals(
  discoverPageData: DiscoverPageData
): Promise<DiscoverPageData> {
  const DAYS_BACK: number = 7
  const dateLastWeek: Date = new Date(new Date().getTime())
  dateLastWeek.setDate(new Date().getDate() - DAYS_BACK)

  const recentlyAdded = await Axios.get(
    `${ApiConfig.API_URI}/v1/journals?sort=-added&limit=10&select=title cover useGeneratedCover&added=>${dateLastWeek}`
  ).then((response) => response.data.docs)

  discoverPageData.recentlyAddedJournals = recentlyAdded ?? []
  return discoverPageData
}

async function discoverPageGetMostViewedJournals(
  discoverPageData: DiscoverPageData
): Promise<DiscoverPageData> {
  const mostViewed = await Axios.get(
    `${ApiConfig.API_URI}/v1/journals?sort=-views&limit=10&select=title cover useGeneratedCover&views=>50`
  ).then((response) => response.data.docs)

  discoverPageData.mostViewedJournals = mostViewed ?? []
  return discoverPageData
}

interface JournalsPageData {
  availableCategories: ICategory[]
  category: ICategory
  sort: string
  journals: IJournal[]
}

/**
 * Get the data of the journals page
 *
 * @param req
 * @param res
 * @param next
 */
export function getJournalsPage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user: IUser | null = (req.user as IUser) ?? null
  const category: string | null = (req.query.category as string) ?? null
  const sort: string | null = (req.query.sort as string) ?? null

  Promise.resolve({} as JournalsPageData)
    .then((journalsPageData) =>
      journalsPageGetAvailableCategories(journalsPageData, user)
    )
    .then((journalsPageData) =>
      journalsPageGetCurrentCategory(journalsPageData, category)
    )
    .then((journalsPageData) => journalsPageGetSorting(journalsPageData, sort))
    .then((journalsPageData) => journalsPageGetJournals(journalsPageData, user))
    .then((journalsPageData) => res.json(journalsPageData))
    .catch(next)
}

async function journalsPageGetAvailableCategories(
  journalsPageData: JournalsPageData,
  user: IUser | null
): Promise<JournalsPageData> {
  const specialAvailableCategories = [
    {
      _id: 'all',
      title: 'All Journals',
    } as ICategory,
  ]
  if (user) {
    specialAvailableCategories.push({
      _id: 'favorites',
      title: 'Favorite Journals',
    } as ICategory)
  }

  const categoriesResponse = await Axios.get(
    `${ApiConfig.API_URI}/v1/categories?display=true&select=title`
  )

  journalsPageData.availableCategories = [
    ...specialAvailableCategories,
    ...categoriesResponse.data.docs,
  ]
  return journalsPageData
}

async function journalsPageGetCurrentCategory(
  journalsPageData: JournalsPageData,
  categoryQuery: string | null
): Promise<JournalsPageData> {
  categoryQuery = categoryQuery ? categoryQuery : 'all'

  let currentCategory: ICategory
  switch (categoryQuery) {
    case 'all': {
      currentCategory = {
        _id: 'all',
        title: 'All Journals',
        color: '#ffffff',
      } as ICategory
      break
    }
    case 'favorites': {
      currentCategory = {
        _id: 'favorites',
        title: 'Favorite Journals',
        color: '#ffffff',
      } as ICategory
      break
    }
    default: {
      currentCategory = await Axios.get(
        `${ApiConfig.API_URI}/v1/categories/${categoryQuery}`
      ).then((response) => response.data)
      break
    }
  }

  journalsPageData.category = currentCategory
  return journalsPageData
}

async function journalsPageGetSorting(
  journalsPageData: JournalsPageData,
  sort: string | null
): Promise<JournalsPageData> {
  const possibleSortValues: string[] = [
    '+title',
    '-latestPubdate',
    '-added',
    '-views',
  ]

  sort = sort && possibleSortValues.includes(sort) ? sort : '+title'

  journalsPageData.sort = sort
  return journalsPageData
}

async function journalsPageGetJournals(
  journalsPageData: JournalsPageData,
  user: IUser | null
): Promise<JournalsPageData> {
  const category = journalsPageData.category._id ?? 'all'
  const sort = journalsPageData.sort ?? '+title'

  let journalsResponse
  switch (category) {
    case 'all': {
      journalsResponse = await Axios.get(
        `${ApiConfig.API_URI}/v1/journals?sort=${sort}&limit=20&select=title cover useGeneratedCover`
      )
      break
    }
    case 'favorites': {
      if (!user)
        throw Error(`Requested favorite journals, but no one is logged in`)

      if (!user.favoriteJournals.length) {
        journalsResponse = {
          data: {
            docs: [],
          },
        }
        break
      }

      const idQuery: string = (user.favoriteJournals as string[]).reduce(
        (acc, id) => `${acc ? `${acc}&` : acc}_id[]=${id}`,
        ''
      )

      journalsResponse = await Axios.get(
        `${ApiConfig.API_URI}/v1/journals?${idQuery}&sort=${sort}&limit=20`
      )
      break
    }
    default: {
      journalsResponse = await Axios.get(
        `${ApiConfig.API_URI}/v1/journals?categories[]=${category}&sort=${sort}&limit=20&select=title cover useGeneratedCover`
      )
      break
    }
  }

  journalsPageData.journals = journalsResponse?.data.docs ?? []
  return journalsPageData
}

interface CategoriesPageData {
  categories: ICategory[]
}

/**
 * Get the data for displaying the categories page
 *
 * @param req
 * @param res
 * @param next
 */
export function getCategoriesPage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  Promise.resolve({} as CategoriesPageData)
    .then(categoriesPageGetCategories)
    .then((categoriesPageData) => res.json(categoriesPageData))
    .catch(next)
}

async function categoriesPageGetCategories(
  categoriesPageData: CategoriesPageData
): Promise<CategoriesPageData> {
  const categories = await Axios.get(
    `${ApiConfig.API_URI}/v1/categories?select=title color&sort=+title`
  ).then((response) => response.data.docs)

  categoriesPageData.categories = categories ?? []
  return categoriesPageData
}

interface SearchPageData {
  categories: ICategory[]
  journals: IJournal[]
  articles: IArticle[]
}

/**
 * Get the data for displaying the search page
 *
 * @param req
 * @param res
 * @param next
 */
export function getSearchPage(req: Request, res: Response, next: NextFunction) {
  const term = (req.query.q as string) ?? ''

  Promise.resolve({} as SearchPageData)
    .then((searchPageData) => searchPageGetCategories(searchPageData, term))
    .then((searchPageData) => searchPageGetJournals(searchPageData, term))
    .then((searchPageData) => searchPageGetArticles(searchPageData, term))
    .then((searchPageData) => res.json(searchPageData))
    .catch(next)
}

async function searchPageGetCategories(
  searchPageData: SearchPageData,
  term: string
): Promise<SearchPageData> {
  const categories = await Axios.get(
    `${ApiConfig.API_URI}/v1/categories?search=${term}&limit=15&sort=+title&select=title color`
  ).then((response) => response.data.docs)

  searchPageData.categories = categories ?? []
  return searchPageData
}

async function searchPageGetJournals(
  searchPageData: SearchPageData,
  term: string
): Promise<SearchPageData> {
  const journals = await Axios.get(
    `${ApiConfig.API_URI}/v1/journals?search=${term}&limit=15&sort=+title&select=title cover issn eissn useGeneratedCover`
  ).then((response) => response.data.docs)

  searchPageData.journals = journals ?? []
  return searchPageData
}

async function searchPageGetArticles(
  searchPageData: SearchPageData,
  term: string
): Promise<SearchPageData> {
  const articles = await Axios.get(
    `${ApiConfig.API_URI}/v1/articles?search=${term}&populate=publishedIn&populateSelect=cover title useGeneratedCover&sort=-pubdate&limit=15&select=title authors pubdate publishedIn doi`
  ).then((response) => response.data.docs)

  searchPageData.articles = articles ?? []
  return searchPageData
}
