// Type Sketch Template

var Template = function() {
	this.c;

	this.ascender = {
		height: 850,
		color: [221, 158, 158],
		dash: [1, 2],
	};

	this.cap_height = {
		height: 800,
		color: [218, 207, 154],
		dash: [5, 10],
	};

	this.x_height = {
		height: 600,
		color: [180, 218, 124],
		dash: [5, 10],
	};

	this.baseline = {
		height: 300,
		color: [160, 160, 160],
	};

	this.descender = {
		height: 100,
		color: [137, 173, 197],
		dash: [1, 2],
	};

	this.init = function(c) {
		this.c = c;
	};

	this.draw = function() {
		var w = this.c.canvas.width;
		var h = this.c.canvas.height;

		this.c.clearRect(0, 0, w, h);

		// draw the rulers
		this.drawRulers();

		// draw the ghosted characters
		this.drawCharacters();

		// draw the lines
		this.c.lineWidth = 1;
		this.drawLine(this.ascender);
		this.drawLine(this.cap_height);
		this.drawLine(this.x_height);
		this.drawLine(this.baseline);
		this.drawLine(this.descender);

		// output PDF
		this.generatePDF();
	};

	this.getHeight = function(height) {
		return this.c.canvas.height - Math.round((height / 1000) * this.c.canvas.height);
	};

	this.drawLine = function(line) {
		var c = this.c;
		c.save();

		var height = this.getHeight(line.height);

		if (c.setLineDash) {
			if (line.dash) {
				c.setLineDash(line.dash);
			} else {
				c.setLineDash([]);
			}
		}

		c.beginPath();
		c.strokeStyle = "rgb(" + line.color[0] + ", " + line.color[1] + ", " + line.color[2] + ")";
		c.moveTo(0, height);
		c.lineTo(c.canvas.width, height);
		c.stroke();
		c.closePath();

		c.restore();
	};

	// This function is so hackish
	this.drawCharacters = function() {
		var c = this.c;

		var strokeWidth = 20;
		var halfStrokeWidth = strokeWidth / 2;

		var t_x = c.canvas.width * .25;
		var t_width = 180;
		var h_x = c.canvas.width * .5;
		var h_width = 100;
		var j_x = c.canvas.width * .82;
		var j_width = 50;
		var j_dot = 20;

		// Setup
		c.save();
		c.strokeStyle = "#ddd";
		c.lineWidth = strokeWidth;

		// T (cap-height)
		c.beginPath();
		c.moveTo(t_x, this.getHeight(this.baseline.height));
		c.lineTo(t_x, this.getHeight(this.cap_height.height));
		c.moveTo(t_x - (t_width / 2), this.getHeight(this.cap_height.height) + halfStrokeWidth);
		c.lineTo(t_x + (t_width / 2), this.getHeight(this.cap_height.height) + halfStrokeWidth);
		c.closePath();
		c.stroke();

		// h (ascender, x-height)
		c.beginPath();
		c.moveTo(h_x, this.getHeight(this.baseline.height));
		c.lineTo(h_x, this.getHeight(this.ascender.height));
		c.moveTo(h_x + halfStrokeWidth, this.getHeight(this.x_height.height) + halfStrokeWidth);
		c.lineTo(h_x + h_width, this.getHeight(this.x_height.height) + halfStrokeWidth);
		c.lineTo(h_x + h_width, this.getHeight(this.baseline.height));
		c.stroke();

		// j (descender)
		c.beginPath();
		c.moveTo(j_x, this.getHeight(this.x_height.height));
		c.lineTo(j_x, this.getHeight(this.descender.height) - halfStrokeWidth);
		c.lineTo(j_x - j_width, this.getHeight(this.descender.height) - halfStrokeWidth);
		c.stroke();

		c.beginPath();
		c.moveTo(j_x, this.getHeight(this.x_height.height) - j_dot);
		c.lineTo(j_x, this.getHeight(this.x_height.height) - j_dot * 2);
		c.stroke();

		// Restore	
		c.restore();
	};

	this.drawRulers = function() {
		var c = this.c;

		c.fillStyle = "#ccc";
		c.font = "9px helvetica";
		c.textBaseline = "middle";

		for (var i=100; i<1000; i+=100) {
			c.fillText(1000 - i, 5, this.getHeight(1000 - i));
		}
	};

	this.generatePDF = function() {
		var pdf = new jsPDF('landscape', 'in', 'letter');
		pdf.setFont('helvetica');
		pdf.setTextColor(130, 130, 130);

		var numRows = parseInt($("#rows-box").val());

		var margin = 0.65;				// Outer margin

		var pageWidth = 11;
		var pageHeight = 8.5;

		var right = pageWidth - margin;
		var bottom = pageHeight - margin;

		var frameWidth = pageWidth - (margin * 2);
		var frameHeight = pageHeight - (margin * 2);

		var rowPadding = numRows <= 2 ? 0.75 : 0.5;			// Margin between rows
		var rowHeight = (frameHeight / numRows) - (rowPadding * (numRows - 1) / numRows);
		var curRow = 0;

		var fontSize = numRows <= 2 ? 6 : 4;

		var lineWeight = 1 / 72;
		var labelXPadding = numRows <= 2 ? (18 / 72) : (14 / 72);
		var labelYPadding = numRows <= 2 ? (3 / 72) : (2 / 72);
		var labelLine = numRows <= 2 ? (16 / 72) : (12 / 72);			// X coord of line to right of 100/200/300 labels

		var getPDFHeight = function(height) {
			return ((1000 - height) / 1000 * rowHeight) + margin + curRow;
		};

		var drawLine = function(line, label) {
			var h = getPDFHeight(line.height);

			pdf.setDrawColor(line.color[0], line.color[1], line.color[2]);
			dashedLine(pdf, line, margin + labelXPadding, h, right, h);

			pdf.setFontSize(fontSize);
			pdf.text(margin + labelXPadding, h - labelYPadding, label);

			pdf.setDrawColor(0, 0, 0);
		};

		var dashedLine = function(pdf, line, x1, y1, x2, y2) {
			var lineMultiplier = 1 / 72;

			if (line.dash) {
				var lx = x1;
				var index = 0;

				while (lx < x2) {
					if (index % 2 == 0) {
						// Only draw the lined parts
						pdf.line(lx, y1, lx + (line.dash[index] * lineMultiplier), y2);
					}

					lx += line.dash[index] * lineMultiplier;

					index++;

					// Wrap around
					if (index >= line.dash.length) {
						index = 0;
					}
				}
			} else {
				pdf.line(x1, y1, x2, y2);
			}
		}

		for (var i=0; i<numRows; i++) {
			// Labels
			pdf.setFontSize(fontSize);
			for (var j=0; j<=1000; j+=100) {
				pdf.text(0.6, getPDFHeight(j - 2), " " + j);	// - 2 for adjustment to center vertically
			}
			pdf.setDrawColor(200, 200, 200);
			pdf.setLineWidth(1 / 72);
			pdf.line(margin + labelLine, getPDFHeight(0), margin + labelLine, getPDFHeight(1000));

			// Lines
			pdf.setLineWidth(lineWeight);
			drawLine(this.ascender, 'ascender');
			drawLine(this.cap_height, 'cap-height');
			drawLine(this.x_height, 'x-height');
			drawLine(this.baseline, 'baseline');
			drawLine(this.descender, 'descender');

			curRow += rowHeight + rowPadding;
		}
		
		return pdf;
	};

	this.downloadPDF = function() {
		var type = 'new-window';
		var pdf = this.generatePDF();

		switch (type) {
			case 'download':
				pdf.save('template.pdf');
				break;
			case 'new-window':
				window.open(pdf.output('datauristring'));
				break;
			case 'iframe':
				var string = pdf.output('datauristring');
				$('iframe').attr('src', string);
				$('iframe').show();
				break;
		}
	};
};

$(document).ready(function() {
	var canvas = document.getElementById("canvas");
	var c = canvas.getContext("2d");

	var template = new Template();
	template.init(c);

	template.draw(c);

	var changeCSS = function(line, label) {
		$("div." + label + " label").css("color", "rgb(" + line.color[0] + ", " + line.color[1] + ", " + line.color[2] + ")");
	};

	changeCSS(template.ascender, "ascender");
	changeCSS(template.cap_height, "cap-height");
	changeCSS(template.x_height, "x-height");
	changeCSS(template.baseline, "baseline");
	changeCSS(template.descender, "descender");

	$("div.ascender input").val(template.ascender.height);
	$("div.cap-height input").val(template.cap_height.height);
	$("div.x-height input").val(template.x_height.height);
	$("div.baseline input").val(template.baseline.height);
	$("div.descender input").val(template.descender.height);

	$("form.controls div").on("change", function() {
		var type = $(this).attr('class').replace("-", "_");

		template[type].height = parseFloat($(this).find("input").val().trim());

		// Update the canvas
		template.draw(c);
	});

	$(".download").on("click", function() {
		template.downloadPDF();
	});
});
