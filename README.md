# Multimedia Services in Internet - Assignment 2 Repository

This serves as the project repository for the [Multimedia Services in Internet](https://mycourses.aalto.fi/course/view.php?id=28185) course at Aalto University, 2020.

The team/pair for this project consists of:
- Alazar Alemayehu Abebaw
- Axel Ilmari Neergaard

---

## Tools

Apache HTTP (httpd) containerized with Docker:
> [hub.docker.com/\_/httpd/](https://hub.docker.com/_/httpd/)

dash.js:
> https://github.com/Dash-Industry-Forum/dash.js/

dash.js metric samples:
> https://reference.dashif.org/dash.js/latest/samples/index.html

---

To run the Docker container you need to install the `docker` Python3 package.
Then execute the `bin/run-apache` script inside the project root.
This will open a Docker container on your local machine, exposing port `8080`.

For an example encoded video stream for testing, you can download a readily available video with the `download-big-buck-bunny.sh` script.
This is not a video encoded by us, so please mind that we take no responsibility on the download.
The script may also run for a long time, but it displays progress.
