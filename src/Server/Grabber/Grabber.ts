/****** This Grabber will grab courses info from websites ******/
import {Terms, CourseInfo} from "../../Shared/SharedData";
import fetch from 'node-fetch';
import {Response} from "node-fetch";

import {parse, HTMLElement} from 'node-html-parser';
import {HTMLParseException} from "../../Exceptions";

export class Grabber {
    constructor(){

    }

    public static getCourse(course: CourseInfo): Promise<string[]> {
        return new Promise<string[]>((resolve) => {
            fetch(Grabber.getCourseURL(course)).then(
                (data: Response) => {
                    data.text().then (
                        (text) => 
                            Grabber.getCourseFromData(text).then(
                                (result) => 
                                    resolve(result)
                            )
                    )
                }
            ).catch(() => {

            });
        });
    }

    public static getSubjects(term: Terms): Promise<string[]>{
        return new Promise<string[]>((resolve) => {
            fetch(Grabber.getTermURL(term)).then(
                (data: Response) =>
                    data.text().then(
                        (text) =>
                            Grabber.getSubjectsFromData(text).then(
                                (result) =>
                                    resolve(result))
            )).catch(()=> {
                
            });
        });
    }

    public static getTermURL(term: Terms): string{
        let cd = term.slice(term.length-1);
        let yr = term.slice(0, term.length-1);
        return `https://courses.students.ubc.ca/cs/courseschedule?sesscd=${cd}&tname=subj-all-departments&sessyr=${yr}&pname=subjarea`
    }

    public static getCourseURL(course: CourseInfo): string {
        const dept = course.subject;
        const courseNum = course.course_id;
        return `https://courses.students.ubc.ca/cs/courseschedule?pname=subjarea&tname=subj-course&dept=${dept}&course=${courseNum}`;
    }

    public static getSubjectsFromData(text: string): Promise<string[]> {
        let root = parse(text) as HTMLElement;
        return new Promise((resolve, reject) =>{
            let table = root.querySelector("#mainTable");
            if (table !== null) {
                let deptElements = table.querySelectorAll('tr');
                let deptTexts = deptElements.map((elem) => elem.querySelector('td a'));
                let texts = deptTexts
                    .filter((elem) => elem instanceof HTMLElement)
                    .map((elem) => elem.childNodes[0].rawText);
                return resolve(texts);
            }
            return reject(new HTMLParseException());
        });
    }

    public static getCourseFromData(text: string): Promise<string[]> {
        let root = parse(text) as HTMLElement;
        return new Promise((resolve, reject) => {
            let table = root.querySelector(".section-summary");
            if (table != null) {
                let sectionElements = table.querySelectorAll('tr');
                let sectionTexts = sectionElements.map((elem) => elem.querySelector('td a'));
                let texts = sectionTexts.filter((elem) => elem instanceof HTMLElement).map((elem) => elem.childNodes[0].rawText);
                return resolve(texts);
            }
            return reject(new HTMLParseException());
        })
       
    }
}