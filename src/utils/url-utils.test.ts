import { describe, expect, it } from "@jest/globals"
import {UrlUtils} from "./url-utils";

describe("UrlUtils", () => {
    describe("getFirstCourseUrl", () => {
        it("with slash", () => {
            // Arrange
            const courseUrl: string = "https://www.memrise.com/course/1234567890/learn-english-1/";
            const expected: string = "https://www.memrise.com/course/1234567890/learn-english-1/1/";

            // Act
            const result: string = UrlUtils.getFirstCourseUrl(courseUrl);

            // Assert
            expect(result).toBe(expected);
        });

        it("without slash", () => {
            // Arrange
            const courseUrl: string = "https://www.memrise.com/course/1234567890/learn-english-1";
            const expected: string = "https://www.memrise.com/course/1234567890/learn-english-1/1/";

            // Act
            const result: string = UrlUtils.getFirstCourseUrl(courseUrl);

            // Assert
            expect(result).toBe(expected);
        });
    });
});