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

        it('should handle odd USX marker formatting', () => {
            var examples = [
                {
                    text: `blah blah blah  <verse    style="v"  number="20"   />   bob`,
                    verses: [20]
                },
                {
                    text: `blah blah      <verse
                        number="5"  style="v" /> bob`,
                    verses: [5]
                },
                {
                    text: `blah blah <verse       number="1000"   style="v"/>`,
                    verses: [1000]
                },
                {
                    text: `blah blah <verse       number="1000"   style="v"/><verse style="v" number="1"/>
                        bob`,
                    verses: [1, 1000]
                },
                {
                    text: `blah blah <verse number="2" style="v"/><verse number="1" style="v" /><verse number="3" style="v"  /> bob`,
                    verses: [1, 2, 3]
                }
            ];

            examples.forEach(function (example) {
                var result = renderer.convertVerseMarkers(example.text);
                expect(result.verses).toEqual(example.verses);
            });
        });

        it('should handle USX verse bridges', () => {
            var example = 'blah blah <verse number="18-19" style="v" /> bob';

            var result = renderer.convertVerseMarkers(example);

            expect(result.verses).toEqual([18, 19]);
        });
    });
});
