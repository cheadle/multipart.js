mailmod
========
mailmod is a javascript module for parsing multipart emails client side. It is designed to be as simple and object-oriented as possible. An email is a wrapper for a part. Every part has a header, body and sometimes nested parts. 

Demo
----------------------------
`ruby rmailmod.rb`

Next Steps
------------------
Next steps might be to parse 'Received' headers into an array in the Header object. That would allow easy access the 'Received' header chain for features like spam detection. Perhaps also add support for a queue or collection of emails. 

License
------------
This software may be redistributed under the terms specified in the MIT-LICENSE file.


[home]:https://github.com/chedazzle/mailmod
[wiki]:https://github.com/chedazzle/mailmod/wiki
[chedazzle]:http://twitter.com/chedazzle