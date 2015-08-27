# OPD Use of force
Analysis and map for Joaquin's story on OPD's use of force

## Minimum Requirements
This project supports Ubuntu Linux 14.04 and Mac OS X Yosemite. It is not tested or supported for the Windows OS.

- [Django 1.7+](https://www.djangoproject.com/)
- [PostgreSQL 9.3+](http://www.postgresql.org/)
- [PostGIS 2.1+](http://postgis.net/)
- [virtualenvwrapper](http://virtualenvwrapper.readthedocs.org/en/latest/)
- (optional) [Node.js 0.12.x](http://nodejs.org/) or [io.js 1.2.x](https://iojs.org/en/index.html)

## Quickstart
```bash
$ mkvirtualenv opd-use-of-force
$ git clone [TK] && cd $_
$ pip install -r requirements/project.txt && fab npm:install && fab bower:install
$ fab rs
```

## Data
Ask Joaquin for original data

### Bootstrap
```bash
$ mv data.csv opd_use_of_force/opd_use_of_force/data/
$ python manage.py loaddata
```
