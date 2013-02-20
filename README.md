## Typlate

A small web app to create PDF templates for sketching typefaces. Written in JavaScript. Uses jsPDF.

### Usage

You can set the y location of each guide using the textboxes. When you're happy with the proportions, click Download. The PDF will open in a new window (where you can print it or save it).

### Notes

Safari and Firefox don't yet support the Canvas API for dashed lines, so the preview lines are solid there.

If you're using Chrome, change the `type` variable in `template.downloadPDF` to 'download' and then the Download button will actually download the file rather than opening it in a new window. (I had to patch jsPDF per [this comment](https://github.com/MrRio/jsPDF/issues/59#issuecomment-13178818) to get it to work, though.)
