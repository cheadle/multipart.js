// singleton module for parsing multipart emails
// author: greg cheadle

var MailMod = (function() {
	
	// email wrapper object
	function Email(str) {
		var email = Part(str);
		
		if (isMultiPart(email)) {
			email.parts = getParts(email);
		} else {
			// TODO: handle single part emails
		}
		
		return email;
	}
	
	// part object
	function Part(str) {
		var part = {};
		var parts = [];
		
		part.raw = str;
		part.contentType = getContentType(str);
		part.mimeType = getMimeType(part);
		part.boundary = getBoundary(part);
		part.bodyIndex = getBodyIndex(part);
		part.contentBody = getBodyString(part);
		
		// every part has a header
		part.header = Header(getHeaderString(part));
		
		return part;
	}
	
	// header object
	function Header(str) {
		var header = {};
		var fields = str.replace(/\n\s+/gm," ").split(/\n/gm);
		
		var recievedChain = []; // TODO: handle 'Recieved' header chain

		$.each(fields, function(index, value) {
			var h = value.split(': ');
			if (h.length > 1) {
				header[h[0]] = h[1];
			}
		});

		return header;
	}
	
	// recurse to get sub parts
	function getParts(part) {
		var parts = [];
		var partStrings = getBodyString(part).split("--" + part.boundary);
		
		for (var i=0;i < partStrings.length;i++) {
			if (isValidPart(partStrings[i])) {
				var newPart = Part(partStrings[i]);
				if (isMultiPart(newPart)) {
					newPart.parts = getParts(newPart);
				}
				parts.push(newPart);
			}
		}
		
		return parts;
	}
	
	// utility methods
	function isValidPart(str) {
		return (/^Content-Type: ((.|\n )+)\n/m).test(str);
	}
	
	function isMultiPart(part) {
		return (/^multipart\/(.+);/i).test(part.contentType);
	}
	
	function getContentType(str) {
		return (/^Content-Type: ((.|\n )+)\n/m).exec(str)[1];
	}
	
	function getMimeType(part) {
		return (/^(.+);/i).exec(part.contentType)[1];
	}
	
	function getHeaderString(part) {
		return part.raw.substring(0, part.bodyIndex);
	}
	
	function getBodyString(part) {
		return part.raw.substring(part.bodyIndex);
	}
	
	// get boundary if one exists
	function getBoundary(part) {
		var boundary = (/boundary=(.+)/);
		if (boundary.test(part.contentType)) {
			return boundary.exec(part.contentType)[1];
		}
	}
	
	// get body index from boundary or first blank line
	function getBodyIndex(part) {		
		if (part.boundary) {
			return part.raw.indexOf("--" + part.boundary);
		} else {
			return (/(\n\n)/m).exec(part.raw).index;
		}
	}
	
	// load email via xhr
	function getData(path) {	
		$.ajax({
		  url: path,
		  dataType: 'text',
		  success: function(data) {
				var email = Email(data);
				showEmail(email);
		  },
		  error: function(XMLHttpRequest, textStatus, errorThrown) {
		    console.log(textStatus, errorThrown);
				alert("Error retrieving email");
		  }
		});
	}
	
	// demo
	function showEmail(email) {
		$('#to').html('To: ' + email.header['To']);
		$('#from').html('From: ' + email.header['From']);
		$('#subject').html('Subject: ' + email.header['Subject']);
		$('#date').html('Date: ' + email.header['Date']);
		$('#content_type').html("Content Type: " + email.contentType + "<br/>");
		
		if (email.parts) {
			showParts(email.parts, "Part ");
		} else {
			$('#parts').append('<div class="content">' + email.contentBody + '</div>');
		}
	}
	
	function showParts(parts, lbl) {
		for (var i=0;i < parts.length;i++) {
			$('#parts').append('<div class="part">' + lbl + (i+1) + '</div>');
			jQuery.each(parts[i].header, function(key, val) {
				$('#parts').append('<div class="header">' + key + ' : ' + val + '</div>');
			});
			if (parts[i].mimeType.match(/^text/)) {
				$('#parts').append('<div class="content">' + parts[i].contentBody + '</div>');
			}
			if (parts[i].parts) {
				showParts(parts[i].parts, "Alternative Part ");
			}
		}
	}
	
	return {
		loadEmail: function(path) {
			getData(path);
		}
	};
	
}());

