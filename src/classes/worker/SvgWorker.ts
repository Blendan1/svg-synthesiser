import {parentPort, workerData} from "worker_threads"
import {SvgLoader} from "../SvgLoader";

const paths: string[] = []
workerData.src.forEach((s: string) => {
    paths.push(new SvgLoader(s).loadSvg().svgPath)
    parentPort?.postMessage({done: false})
});

parentPort?.postMessage({paths, done: true})
