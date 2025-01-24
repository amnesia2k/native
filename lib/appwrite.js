import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
} from "react-native-appwrite";

export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.amnesia.aora",
  projectId: "67936cc9002ff00e6653",
  dbId: "67936e630020fa17d184",
  userCollectionId: "67936e82003892aa902d",
  videoCollectionId: "67936e9b0010d8d790b4",
  storageId: "67936fa80025b1314fd3",
};

// Init your React Native SDK
const client = new Client();

client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setPlatform(config.platform);

const account = new Account(client);
const avatars = new Avatars(client);
const db = new Databases(client);

export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await db.createDocument(
      config.dbId,
      config.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const signIn = async (email, password) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);

    return session;
  } catch (err) {
    throw new Error(err);
  }
};

export const getCurrentUser = async () => {
  try {
    const currAccount = await account.get();

    if (!currAccount) throw Error;

    const currUser = await db.listDocuments(
      config.dbId,
      config.userCollectionId,
      [Query.equal("accountId", currAccount.$id)]
    );

    if (!currUser) throw Error;

    return currUser[0];
  } catch (error) {
    console.error(error);
  }
};
