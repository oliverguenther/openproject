module OpenProject::Bim::BcfXml
  class XmlImporter

    attr_reader :file

    def initialize(file)
      @file = file
    end

    def read
      Zip::File.open(file) do |zip|
        topics = get_topic_markups(zip)
      end
    end

    private

    def get_topic_markups(zip)
      topics = zip
        .select { |entry| entry.name.end_with? 'markup.bcf' }
        .map { |entry | [topic_uuid(entry), entry] }

      Hash[topics.map {}]
    end

    ##
    # Get the topic name of an entry, if any
    def topic_uuid(entry)
      entry.split('/')&.first
    end
  end
end
