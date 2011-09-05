// singleton module for parsing multipart emails
// author: greg cheadle

var MailMod = (function() {
	
	// email wrapper object
	function Email(str) {
		var email = Part(str);
		
		if (email.multiPart) {
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
		part.contentType = (/^Content-Type: ((.|\n )+)\n/m).exec(part.raw)[1];
		part.multiPart = (/^multipart\/(.+);/i).test(part.contentType);
		part.mimeType = (/^(.+);/i).exec(part.contentType)[1];
		part.hasBoundary = (/boundary=(.+)/).exec(part.contentType);
		part.boundary = part.hasBoundary ? part.hasBoundary[1] : null;
		part.bodyIndex = (/(\n\n)/m).exec(part.raw).index;
		part.contentBody = part.raw.substring(part.bodyIndex);
		
		// every part has a header
		part.header = Header(part);
		return part;
	}
	
	// header object
	function Header(part) {
		var header = {};
		var str = part.raw.substring(0, part.bodyIndex);
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
		var partStrings = part.contentBody.split("--" + part.boundary);
		
		for (var i=0;i < partStrings.length;i++) {
			if (isValidPart(partStrings[i])) {
				var newPart = Part(partStrings[i]);
				if (newPart.multiPart) {
					newPart.parts = getParts(newPart);
				}
				parts.push(newPart);
			}
		}
		
		return parts;
	}
	
	function isValidPart(str) {
		return (/^Content-Type: ((.|\n )+)\n/m).test(str);
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

