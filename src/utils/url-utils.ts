export class UrlUtils {
    public static getFirstCourseUrl(courseUrl: string): string  {
        const separator: string = courseUrl.endsWith('/') ? '' : "/";
        return `${courseUrl}${separator}1/`;
    }
}