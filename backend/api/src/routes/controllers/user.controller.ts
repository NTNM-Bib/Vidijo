import ApiConfig from "../../api.config";
import { Request, Response, NextFunction } from "express";
import Boom from "@hapi/boom";
import { IUser } from "../../shared/interfaces";
import Axios from "axios";

class UserController {
  // Get all users (admin only)
  public async getUsers(req: Request, res: Response, next: NextFunction) {
    const currentlyLoggedInUser: any = req.user;

    if (!currentlyLoggedInUser) {
      return next(Boom.unauthorized(`Nobody is currently logged in`));
    }

    // Convert parsed query back to string
    let query: string = "?";
    for (let key in req.query) {
      query += `${key}=${req.query[key]}&`;
    }

    const usersResponse = await Axios.get(
      `${ApiConfig.USER_SERVICE_URI}/v1/users${query}`
    ).catch((err) => {
      return next(err);
    });

    return res.status(200).json(usersResponse.data);
  }

  // Get User with given ID (if ID is "me", return the currently logged in User)
  public async getUser(req: Request, res: Response, next: NextFunction) {
    const currentlyLoggedInUser: any = req.user;
    let targetUserId: string = req.params.id;

    // Check if currently logged in user can edit the target user
    if (!canEdit(currentlyLoggedInUser, targetUserId)) {
      return next(
        Boom.unauthorized(
          `User ${currentlyLoggedInUser._id} is missing permissions to edit user ${targetUserId}`
        )
      );
    }

    if (targetUserId === "me") {
      targetUserId = currentlyLoggedInUser._id;
    }

    const userResponse = await Axios.get(
      `${ApiConfig.USER_SERVICE_URI}/v1/users/${targetUserId}`
    ).catch((err) => {
      return next(err);
    });

    return res.status(200).json(userResponse.data);
  }

  // Get the users (:id) favorite Journals
  public async getFavoriteJournals(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const currentlyLoggedInUser: any = req.user;
    let targetUserId: string = req.params.id;

    // Check if currently logged in user can edit the target user
    if (!canEdit(currentlyLoggedInUser, targetUserId)) {
      return next(
        Boom.unauthorized(
          `User ${currentlyLoggedInUser._id} is missing permissions to edit user ${targetUserId}`
        )
      );
    }

    if (targetUserId === "me") {
      targetUserId = currentlyLoggedInUser._id;
    }

    // Convert parsed query back to string
    let query: string = "?";
    for (let key in req.query) {
      query += `${key}=${req.query[key]}&`;
    }

    const response = await Axios.get(
      `${ApiConfig.USER_SERVICE_URI}/v1/users/${targetUserId}/favoriteJournals${query}`
    ).catch((err) => {
      return next(err);
    });

    return res.status(200).json(response.data);
  }

  // Add a journal to the users (:id) favorites
  public async addFavoriteJournal(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const currentlyLoggedInUser: any = req.user;
    const journalId: string = req.params.journalId;
    let targetUserId: string = req.params.id;

    // Check if currently logged in user can edit the target user
    if (!canEdit(currentlyLoggedInUser, targetUserId)) {
      return next(
        Boom.unauthorized(
          `User ${currentlyLoggedInUser._id} is missing permissions to edit user ${targetUserId}`
        )
      );
    }

    if (targetUserId === "me") {
      targetUserId = currentlyLoggedInUser._id;
    }

    const response = await Axios.post(
      `${ApiConfig.USER_SERVICE_URI}/v1/users/${targetUserId}/favoriteJournals/${journalId}`
    ).catch((err) => {
      return next(err);
    });

    return res.status(200).json(response.data);
  }

  // Remove a journal from the users (:id) favorites
  public async removeFavoriteJournal(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const currentlyLoggedInUser: any = req.user;
    const journalId: string = req.params.journalId;
    let targetUserId: string = req.params.id;

    // Check if currently logged in user can edit the target user
    if (!canEdit(currentlyLoggedInUser, targetUserId)) {
      return next(
        Boom.unauthorized(
          `User ${currentlyLoggedInUser._id} is missing permissions to edit user ${targetUserId}`
        )
      );
    }

    if (targetUserId === "me") {
      targetUserId = currentlyLoggedInUser._id;
    }

    const response = await Axios.delete(
      `${ApiConfig.USER_SERVICE_URI}/v1/users/${targetUserId}/favoriteJournals/${journalId}`
    ).catch((err) => {
      return next(err);
    });

    return res.status(200).json(response.data);
  }

  // Get the users (:id) reading list
  public async getReadingList(req: Request, res: Response, next: NextFunction) {
    const currentlyLoggedInUser: any = req.user;
    let targetUserId: string = req.params.id;

    // Check if currently logged in user can edit the target user
    if (!canEdit(currentlyLoggedInUser, targetUserId)) {
      return next(
        Boom.unauthorized(
          `User ${currentlyLoggedInUser._id} is missing permissions to edit user ${targetUserId}`
        )
      );
    }

    if (targetUserId === "me") {
      targetUserId = currentlyLoggedInUser._id;
    }

    // Convert parsed query back to string
    let query: string = "?";
    for (let key in req.query) {
      query += `${key}=${req.query[key]}&`;
    }

    const readingListPageResponse = await Axios.get(
      `${ApiConfig.USER_SERVICE_URI}/v1/users/${targetUserId}/readingList${query}`
    ).catch((err) => {
      return next(err);
    });

    return res.status(200).json(readingListPageResponse.data);
  }

  // Add an article to the users (:id) reading list
  public async addArticleToReadingList(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const currentlyLoggedInUser: any = req.user;
    const articleId: string = req.params.articleId;
    let targetUserId: string = req.params.id;

    // Check if currently logged in user can edit the target user
    if (!canEdit(currentlyLoggedInUser, targetUserId)) {
      return next(
        Boom.unauthorized(
          `User ${currentlyLoggedInUser._id} is missing permissions to edit user ${targetUserId}`
        )
      );
    }

    if (targetUserId === "me") {
      targetUserId = currentlyLoggedInUser._id;
    }

    const response = await Axios.post(
      `${ApiConfig.USER_SERVICE_URI}/v1/users/${targetUserId}/readingList/${articleId}`
    ).catch((err) => {
      return next(err);
    });

    return res.status(200).json(response.data);
  }

  // Remove an article from the users (:id) reading list
  public async removeArticleFromReadingList(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const currentlyLoggedInUser: any = req.user;
    const articleId: string = req.params.articleId;
    let targetUserId: string = req.params.id;

    // Check if currently logged in user can edit the target user
    if (!canEdit(currentlyLoggedInUser, targetUserId)) {
      return next(
        Boom.unauthorized(
          `User ${currentlyLoggedInUser._id} is missing permissions to edit user ${targetUserId}`
        )
      );
    }

    if (targetUserId === "me") {
      targetUserId = currentlyLoggedInUser._id;
    }

    const response = await Axios.delete(
      `${ApiConfig.USER_SERVICE_URI}/v1/users/${targetUserId}/readingList/${articleId}`
    ).catch((err) => {
      return next(err);
    });

    return res.status(200).json(response.data);
  }

  // Update user data
  public async patchUser(req: Request, res: Response, next: NextFunction) {
    const currentlyLoggedInUser: any = req.user;
    let targetUserId: string = req.params.id;

    // Check if currently logged in user can edit the target user
    if (!canEdit(currentlyLoggedInUser, targetUserId)) {
      return next(
        Boom.unauthorized(
          `User ${currentlyLoggedInUser._id} is missing permissions to edit user ${targetUserId}`
        )
      );
    }

    if (targetUserId === "me") {
      targetUserId = currentlyLoggedInUser._id;
    }

    const response = await Axios.patch(
      `${ApiConfig.USER_SERVICE_URI}/v1/users/${targetUserId}`,
      req.body
    ).catch((err) => {
      return next(err);
    });

    return res.status(200).json(response.data);
  }
}

// Returns true if the currently logged in user can edit the target user
function canEdit(currentlyLoggedInUser: IUser, targetUserId: string): boolean {
  if (!currentlyLoggedInUser) {
    return false;
  }

  if (currentlyLoggedInUser.accessLevel === "admin") {
    return true;
  }

  if (targetUserId === "me" || targetUserId === currentlyLoggedInUser._id) {
    return true;
  }

  return false;
}

export default new UserController();
