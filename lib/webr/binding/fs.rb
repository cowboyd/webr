module Webr::Binding
  class Fs
    def initialize(context)
      @context = context
    end
    
    def readFile(file_name, callback)
      callback.call(nil, File.new(file_name).read)
    end
  end
end