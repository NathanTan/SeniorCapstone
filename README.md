# Senior Capstone
A repository to host all of group 14's work towards the 2019 Vertical Flight Society's student Micro Air Vehicle competition.

# CS Team
Anton Synytsia<br/>
Matthew Phillips<br/>
Shanmukh Challa<br/>
Nathan Tan<br/>

# Image Rules
When uploading graphics to overleaf, upload them in PNG format (preferably transparent background). When uploading the TEX document to repository, convert all graphics to EPS format with an online converter, and then within the TEX file replace <tt>.png</tt> with <tt>.eps</tt>.

# Generating PDF Documents
After uploading a <tt>TEX</tt> document, run the following commands:

```bash
cd FolderName # Design, Requirements, GroupProblemStatement, or ProgressReport
make
```

When compiled, the PDF document is copied to <tt>GeneratedPDF</tt> folder.

Before pushing the changes, run:

```bash
make clean
```

This will remove all the unnecessary files but leave the PDF in <tt>GeneratedPDF</tt> folder.
