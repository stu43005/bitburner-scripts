/** @param {NS} ns **/
export async function main(ns) {
    const files = ns.ls("home");
    for (const file of files) {
        if (file.endsWith(".js") || file.endsWith(".ns") || file.endsWith(".script")) {
            ns.rm(file, "home");
        }
    }
}
