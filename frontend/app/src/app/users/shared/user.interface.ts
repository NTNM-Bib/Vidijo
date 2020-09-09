export interface IUser {
    _id: string;
    username: string;
    password: string;
    firstName: string;
    secondName: string;
    avatar: string;
    favoriteJournals: any[];
    readingList: any[];
    showOnboarding: boolean;
    accessLevel: "default" | "admin";
}