'use strict';

jest.unmock('../src/js/render');

describe('Renderer', () => {
    var renderer;

    beforeEach(() => {
        renderer = require('../src/js/render').Renderer();
    })

    describe('convertVerseMarkers', () => {
        it('should do nothing when the text is empty', () => {
            var example = '';

            var result = renderer.convertVerseMarkers(example);

            expect(result).toEqual({
                text: '',
                verses: []
            });
        });

        it('should do nothing when there are no USX verse markers', () => {
            var example = `
                <para style="p">
                    1 Jesus saw the crowds and went up a hill, where he sat down.
                    His disciples gathered around him, 2 and he began to teach them:</para>`;

            var result = renderer.convertVerseMarkers(example);

            expect(result).toEqual({
                text: example,
                verses: []
            });
        });

        it('should convert USX verse markers to USFM style markers', () => {
            //NOTE: Be careful with these template strings, as spacing matters!
            var example = `
                <para style="p">
                    <verse number="1" style="v" />Jesus saw the crowds and went up a hill, where he sat down.
                    His disciples gathered around him,
                    <verse number="2" style="v" />and he began to teach them:</para>`;

            var expectedText = `
                <para style="p">
                    \\v 1 Jesus saw the crowds and went up a hill, where he sat down.
                    His disciples gathered around him,
                    \\v 2 and he began to teach them:</para>`;

            var result = renderer.convertVerseMarkers(example);

            expect(result).toEqual({
                text: expectedText,
                verses: [1, 2]
            });
        });

        it('should convert multiple verse markers in a row', () => {
            var example = `blah <verse number="4" style="v"/><verse number="5" style="v"/><verse number="2" style="v"/><verse number="3" style="v"/><verse number="1" style="v"/><verse number="6" style="v"/>`;
            var expectedText = `blah \\v 4 \\v 5 \\v 2 \\v 3 \\v 1 \\v 6 `;

            var result = renderer.convertVerseMarkers(example);

            expect(result.text).toEqual(expectedText);
        });

        it('should return the sorted list of verse numbers', () => {
            var example = `blah <verse number="4" style="v"/><verse number="5" style="v"/><verse number="2" style="v"/><verse number="3" style="v"/><verse number="1" style="v"/><verse number="6" style="v"/>`;
            var expectedVerses = [1, 2, 3, 4, 5, 6];

            var result = renderer.convertVerseMarkers(example);

            expect(result.verses).toEqual(expectedVerses);
        });

        it('should handle odd USX marker formatting', () => {
            var examples = [
                {
                    text: `blah blah blah  <verse    style="v"  number="20"   />   bob`,
                    expected: `blah blah blah  \\v 20    bob`,
                    verses: [20]
                },
                {
                    text: `blah blah      <verse
                        number="5"  style="v" />bob`,
                    expected: `blah blah      \\v 5 bob`,
                    verses: [5]
                },
                {
                    text: `blah blah <verse       number="1000"   style="v"/>`,
                    expected: `blah blah \\v 1000 `,
                    verses: [1000]
                },
                {
                    text: `blah blah <verse       number="1000"   style="v"/><verse style="v" number="1"/>
                        bob`,
                    expected: `blah blah \\v 1000 \\v 1 
                        bob`,
                    verses: [1, 1000]
                },
                {
                    text: `blah blah <verse number="2" style="v"/><verse number="1" style="v" /><verse number="3" style="v"  /> bob`,
                    expected: `blah blah \\v 2 \\v 1 \\v 3  bob`,
                    verses: [1, 2, 3]
                },
                {
                    text: `blah <para style="p"><verse style="v"  number="11"/>The verse eleven
                                which has verse<verse
                                    style="v"
                                    number="10"/>ten, too`,
                    expected: `blah <para style="p">\\v 11 The verse eleven
                                which has verse\\v 10 ten, too`,
                    verses: [10, 11]
                }
            ];

            examples.forEach(function (example) {
                var result = renderer.convertVerseMarkers(example.text);
                expect(result.verses).toEqual(example.verses);
                expect(result.text).toEqual(example.expected);
            });
        });

        it('should handle USX verse bridges', () => {
            var example = 'blah blah <verse number="18-19" style="v" /> bob';

            var result = renderer.convertVerseMarkers(example);

            expect(result.verses).toEqual([18, 19]);
        });
    });
});
