import { sanitize, summerize, getActive, getMaxLineValue } from '../util';

/** sanitize(csv: string) :string[] */
/**
 * Convert csv into an array
 * In each element,
 * allowed characters: 0-9a-zA-Z (space),(comma).(period)
 * Other characteres are eliminated.
 */
describe("sanitize", () => {
    const csv = `a,b,c';<script>alert()</script>,1\nd," onclick="alert(123.1)",f,2`;
    test("check converted array length", () => {
        expect(sanitize(csv).length).toBe(2)
    });
    test("check malicious insertions", () => {
        expect(sanitize(csv)[0]).toBe("a,b,cscriptalertscript,1")
    });
    test("check malicious insertions", () => {
        expect(sanitize(csv)[1]).toBe("d, onclickalert123.1,f,2")
    });
    test("null check", () => {
        expect(sanitize(null)).toEqual([]);
    });
    test("empty check", () => {
        expect(sanitize("")).toEqual([]);
    });
});

/**
 * summerize(csv: string|null) : CovidData[]
 * dependency: addCountry
 */
/**
 * Covid Data
{
    name: string,
    data: number[],
    latest: number
}
 */
const dummyCSV = `Province/State,Country/Region,Lat,Long,1/22/20,1/23/20,1/24/20,1/25/20,1/26/20,1/27/20,1/28/20,1/29/20,1/30/20,1/31/20,2/1/20,2/2/20,2/3/20,2/4/20,2/5/20,2/6/20,2/7/20,2/8/20,2/9/20,2/10/20,2/11/20,2/12/20,2/13/20,2/14/20,2/15/20,2/16/20,2/17/20,2/18/20,2/19/20,2/20/20,2/21/20,2/22/20,2/23/20,2/24/20,2/25/20,2/26/20,2/27/20,2/28/20,2/29/20,3/1/20,3/2/20,3/3/20,3/4/20,3/5/20,3/6/20,3/7/20,3/8/20,3/9/20,3/10/20,3/11/20,3/12/20,3/13/20,3/14/20,3/15/20,3/16/20,3/17/20,3/18/20,3/19/20,3/20/20,3/21/20,3/22/20,3/23/20,3/24/20,3/25/20,3/26/20,3/27/20,3/28/20,3/29/20,3/30/20,3/31/20,4/1/20,4/2/20,4/3/20,4/4/20,4/5/20,4/6/20,4/7/20,4/8/20
,Afghanistan,33.0,65.0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,4,4,5,7,7,7,11,16,21,22,22,22,24,24,40,40,74,84,94,110,110,120,170,174,237,273,281,299,349,367,423,444
,Albania,41.1533,20.1683,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,10,12,23,33,38,42,51,55,59,64,70,76,89,104,123,146,174,186,197,212,223,243,259,277,304,333,361,377,383,400
,Algeria,28.0339,1.6596,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,3,5,12,12,17,17,19,20,20,20,24,26,37,48,54,60,74,87,90,139,201,230,264,302,367,409,454,511,584,716,847,986,1171,1251,1320,1423,1468,1572
Columbia,Canada,49.2827,-123.1207,0,0,0,0,0,0,1,1,1,1,1,1,1,1,2,2,4,4,4,4,4,4,4,4,4,4,5,5,5,5,6,6,6,6,7,7,7,7,8,8,8,9,12,13,21,21,27,32,32,39,46,64,64,73,103,103,186,231,271,424,424,472,617,617,725,725,884,884,970,1013,1013,1121,1174,1203,1203,1266,1266,1291
Grand Princess,Canada,37.6489,-122.6655,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,8,9,9,10,10,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13
Manitoba,Canada,53.7609,-98.8139,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,7,8,15,17,17,18,20,20,21,35,36,39,64,72,96,103,127,167,182,182,203,203,217,217
New Brunswick,Canada,46.5653,-66.4619,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,2,6,8,11,11,11,17,17,17,18,18,33,45,51,66,68,70,81,91,91,91,98,103,105,105
Newfoundland and Labrador,Canada,53.1355,-57.6604,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,3,3,3,4,6,9,24,35,35,82,102,120,135,148,152,175,183,195,195,217,226,228,228
Nova Scotia,Canada,44.682,-63.7443,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,7,12,14,15,21,28,41,51,68,73,90,110,122,127,147,173,193,207,236,262,293,310,310
Ontario,Canada,51.2538,-85.3232,0,0,0,0,1,1,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,6,6,11,15,18,20,20,22,25,28,29,34,36,41,42,74,79,104,177,185,221,257,308,377,425,503,588,688,858,994,1144,1355,1706,1966,2392,2793,3255,3630,4354,4347,4726,5276
Prince Edward Island,Canada,46.5107,-63.4168,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,3,3,3,5,5,9,11,11,18,21,21,22,22,22,22,22,22,25
Quebec,Canada,52.9399,-73.5491,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,2,2,3,4,4,4,8,9,17,17,24,50,74,94,121,139,181,219,628,1013,1342,1632,2024,2498,2840,3430,4162,4611,5518,6101,6101,7944,8580,9340,10031
Saskatchewan,Canada,52.9399,-106.4509,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,7,7,8,16,20,26,52,66,72,72,95,95,134,156,156,184,193,206,220,220,249,249,260,260`;
describe("summerize - addCountry", () => {
    const daysLength = dummyCSV.split("\n")[0].split(",").length - 4;
    test("check number of CovidData array length", () => {
        // Australia, Canada, China are added via addCountry function
        expect(summerize(dummyCSV).length).toBe(6);
    });
    test("check CovidData", () => {
        expect(summerize(dummyCSV)[1].name).toBe("Albania");
        expect(summerize(dummyCSV)[1].data.length).toBe(daysLength);
        expect(Number.isNaN(summerize(dummyCSV)[1].data[0])).toBe(false);
        expect(Number.isNaN(summerize(dummyCSV)[1].latest)).toBe(false)
    });
    test("check CovidData for special country(Canada)", () => {
        const countries = summerize(dummyCSV);
        const filtered = countries.filter(country => country.name === "Canada");
        expect(filtered.length).toBe(1);
        expect(filtered[0].name).toBe("Canada");
        expect(filtered[0].data.length).toBe(daysLength);
        expect(Number.isNaN(filtered[0].data[0])).toBe(false);
        expect(Number.isNaN(filtered[0].latest)).toBe(false)
    });
    test("null check", () => {
        expect(summerize(null).length).toBe(0);
    })
});

/**
 * getActive(arr1, arr2, arr3) arr1-3: CovidData[]
 * get difference of data property: arr1-arr2-arr3
 */
describe("getActive", () => {
    const confirmed = [{
        name: "Japan",
        data: [11, 12, 13, 14, 15],
        latest: 15
    }, {
        name: "US",
        data: [121, 122, 123, 134, 135],
        latest: 25
    }];
    const death = [{
        name: "Japan",
        data: [1, 2, 3, 4, 5],
        latest: 1
    }, {
        name: "US",
        data: [11, 12, 13, 14, 15],
        latest: 25
    }];
    const recovered = [{
        name: "Japan",
        data: [5, 6, 7, 8, 9],
        latest: 9
    }, {
        name: "US",
        data: [15, 16, 17, 18, 19],
        latest: 9
    }];
    test("getActive", () => {
        const active = getActive(confirmed, death, recovered);
        expect(active.length).toBe(2);
        expect(Object.keys(getActive(confirmed, death, recovered)[0]).length).toBe(3);
        expect(Object.keys(getActive(confirmed, death, recovered)[0]).join(",")).toBe("name,data,latest");
        expect(active[0].name).toBe("Japan");
        expect(active[0].data).toEqual([5, 4, 3, 2, 1]);
        expect(active[0].latest).toBe(1);
        expect(active[1].name).toBe("US");
        expect(active[1].data).toEqual([95, 94, 93, 102, 101]);
        expect(active[1].latest).toBe(101);
    })
});

/**
 * getMaxLineValue(num)
 */
describe("getMaxLineValue", () => {
    test("159=>200", () => {
        expect(getMaxLineValue(159)).toBe(200);
    });
    test("911=>1000", () => {
        expect(getMaxLineValue(911)).toBe(1000);
    });
    test("159=>200", () => {
        expect(getMaxLineValue(0)).toBe(1);
    });
})