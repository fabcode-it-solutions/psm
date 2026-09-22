import {
  adjectives,
  uniqueNamesGenerator,
  Config,
} from "unique-names-generator";
import { carNames } from "./defaults";

export const generateUsername = async () => {
  const config: Config = {
    dictionaries: [carNames, adjectives],
    style: "capital",
    separator: "",
  };
  const characterName: string = uniqueNamesGenerator(config);
  const checkUserName = await fetch(
    `/api/auth/check-username?q=${characterName}`
  );
  const checkUserNameResult = await checkUserName.json();
  if (!checkUserNameResult.isExisting) {
    return checkUserNameResult.username;
  }
};
