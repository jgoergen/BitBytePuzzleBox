import System from "./System";

let system: System = new System();
system
.init()
.then(
    () => {

        system.start();
    })
.catch(
    (err) => {

        console.log("There was an error starting! " + err);
    });