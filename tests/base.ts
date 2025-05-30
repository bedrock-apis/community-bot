import { run } from "../app/main";
import { token } from "./test.data.json" with {type:"json"};

await run(token);