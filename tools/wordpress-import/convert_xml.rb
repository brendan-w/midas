#!/usr/bin/ruby

# Install gem with `$ gem install reverse_markdown`
# Run with `$ ruby context_xml.rb [path/to/input_file.xml] > [output_file.json]`

require 'nokogiri'
require 'reverse_markdown'
require 'time'
require 'json'

filename = ARGV[0]

items = []
File.open(filename) do |file|
  items = Nokogiri::XML(file).xpath('//channel//item')
end

output = []

items.each do |item|
  name = item.at_xpath('wp:post_name').text.strip
  title = item.at_xpath('title').text.strip
  date_str = item.at_xpath('pubDate').text
  date = DateTime.parse(date_str)

  # Determine the state from categories
  if item.at_xpath("category[@nicename='open-opportunities']")
    state = 'open'
  elsif item.at_xpath("category[@nicename='assigned-opportunities']")
    state = 'assigned'
  elsif item.at_xpath("category[@domain='category'][@nicename='closed']")
    state = 'completed'
  else
    next
  end

  # filename = date.strftime("%Y-%m-%d-%H%M%S-"+name+".markdown")
  # path = 'app/posts/'+filename
  content = item.at_xpath('content:encoded').text
  begin
    content = ReverseMarkdown.convert(item.at_xpath('content:encoded').text)
  rescue StandardError => e
    puts "failed to convert to markdown: #{name} (including raw xml text)"
    puts "#{e.message}"
  end

  # Replace relative links, remove clip art, and trim whitespace
  content.gsub! '(/', '(http://gsablogs.gsa.gov/'
  content.gsub! '<!--more-->', '\n\n'
  content.gsub! '&nbsp;', ' '
  content.gsub! '[![Closed tapas task](http://gsablogs.gsa.gov/dsic/files/2013/04/closed_tapas-.jpg)](http://gsablogs.gsa.gov/dsic/files/2013/04/closed_tapas-.jpg)', ''
  content.gsub! '[![](http://gsablogs.gsa.gov/dsic/files/2013/04/closed_tapas-.jpg)](http://gsablogs.gsa.gov/dsic/files/2013/04/closed_tapas-.jpg)', ''
  content.gsub! '[![Tapas plate with the word Closed across.](http://gsablogs.gsa.gov/dsic/files/2013/04/closed_tapas-.jpg)](http://gsablogs.gsa.gov/dsic/files/2013/04/closed_tapas-.jpg)', ''
  content.gsub! '[![Tapas -- small plates](http://gsablogs.gsa.gov/dsic/files/2013/01/pie2.png)](http://gsablogs.gsa.gov/dsic/files/2013/01/pie2.png)', ''
  content.gsub! '[![Closed - a photo of a pie with 20% missing](http://gsablogs.gsa.gov/dsic/files/2013/04/closed_pie-1.jpg)](http://gsablogs.gsa.gov/dsic/files/2013/04/closed_pie-1.jpg)', ''
  content.gsub! '[![](http://gsablogs.gsa.gov/dsic/files/2013/04/closed_hands-1.jpg)](http://gsablogs.gsa.gov/dsic/files/2013/04/closed_hands-1.jpg)', ''
  content.gsub! '[![closed_hands 1](http://gsablogs.gsa.gov/dsic/files/2013/04/closed_hands-1.jpg)](http://gsablogs.gsa.gov/dsic/files/2013/04/closed_hands-1.jpg)', ''
  content.strip!

  output << {
    createdAt: date,
    name: name,
    title: title,
    state: state,
    description: content
  }
end

puts JSON.pretty_generate(output)
