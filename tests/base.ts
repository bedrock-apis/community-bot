import { run } from "../app/main";


// create this json file where is your bot token saved
import { token } from "./test.data.json" with {type: "json"};

await run(token);