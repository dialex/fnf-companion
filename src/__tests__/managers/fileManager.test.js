import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateFilename,
  saveToFile,
  loadFromFile,
} from '../../managers/fileManager';
import yaml from 'js-yaml';

describe('FileManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateFilename', () => {
    it('should generate filename with expected format', () => {
      const now = new Date('2024-12-15T14:30:45');
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const filename = generateFilename('Test Book', 'Hero');

      expect(filename).toBe('test-book-hero-20241215-143045.yaml');
      expect(filename).toMatch(/^[a-z0-9-]+-\d{8}-\d{6}\.yaml$/);

      vi.useRealTimers();
    });

    it('should sanitize book and character names', () => {
      const filename = generateFilename(
        'Test Book With Spaces',
        'Hero Name 123!@#'
      );
      expect(filename).toContain('test-book-with-spaces');
      expect(filename).toContain('hero-name-123---');
    });

    it('should use defaults when book or name is empty', () => {
      const filename1 = generateFilename('', '');
      expect(filename1).toContain('book-character');

      const filename2 = generateFilename('Test Book', '');
      expect(filename2).toContain('test-book-character');

      const filename3 = generateFilename('', 'Hero');
      expect(filename3).toContain('book-hero');
    });
  });

  describe('saveToFile', () => {
    it('should create and download a YAML file', () => {
      const mockClick = vi.fn();
      const mockLink = document.createElement('a');
      mockLink.click = mockClick;

      const mockCreateElement = vi
        .spyOn(document, 'createElement')
        .mockReturnValue(mockLink);
      const mockAppendChild = vi.spyOn(document.body, 'appendChild');
      const mockRemoveChild = vi.spyOn(document.body, 'removeChild');

      const mockURL = {
        createObjectURL: vi.fn(() => 'blob:url'),
        revokeObjectURL: vi.fn(),
      };
      global.URL.createObjectURL = mockURL.createObjectURL;
      global.URL.revokeObjectURL = mockURL.revokeObjectURL;

      const mockBlob = vi.fn();
      global.Blob = mockBlob;

      const state = {
        metadata: { version: '1.0.0', bookname: 'Test Book' },
        character: { name: 'Hero' },
      };

      saveToFile(state, 'Test Book', 'Hero');

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockBlob).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
      expect(mockURL.revokeObjectURL).toHaveBeenCalledWith('blob:url');

      // Verify the blob contains YAML
      const blobCall = mockBlob.mock.calls[0];
      const yamlContent = blobCall[0][0];
      expect(yamlContent).toContain('metadata:');
      expect(yamlContent).toContain('character:');
    });
  });

  describe('loadFromFile', () => {
    it('should return null when no file is selected', async () => {
      const mockCreateElement = vi.spyOn(document, 'createElement');
      const mockInput = {
        type: '',
        accept: '',
        click: vi.fn(),
        onchange: null,
      };
      mockCreateElement.mockReturnValue(mockInput);

      const loadPromise = loadFromFile();
      // Simulate no file selected
      if (mockInput.onchange) {
        mockInput.onchange({ target: { files: [] } });
      }

      const result = await loadPromise;
      expect(result).toBe(null);
    });

    it('should return null for non-YAML files', async () => {
      const mockCreateElement = vi.spyOn(document, 'createElement');
      const mockInput = {
        type: '',
        accept: '',
        click: vi.fn(),
        onchange: null,
      };
      mockCreateElement.mockReturnValue(mockInput);

      const loadPromise = loadFromFile();
      const mockFile = new File(['content'], 'test.txt', {
        type: 'text/plain',
      });
      if (mockInput.onchange) {
        mockInput.onchange({ target: { files: [mockFile] } });
      }

      const result = await loadPromise;
      expect(result).toBe(null);
    });

    it('should return null for invalid YAML', async () => {
      const mockCreateElement = vi.spyOn(document, 'createElement');
      const mockInput = {
        type: '',
        accept: '',
        click: vi.fn(),
        onchange: null,
      };
      mockCreateElement.mockReturnValue(mockInput);

      const mockFileReaderInstance = {
        readAsText: vi.fn(),
        onload: null,
        onerror: null,
        result: 'invalid: yaml: [',
      };

      global.FileReader = class MockFileReader {
        constructor() {
          return mockFileReaderInstance;
        }
      };

      const loadPromise = loadFromFile();
      const mockFile = new File(['invalid: yaml: ['], 'test.yaml', {
        type: 'text/yaml',
      });
      if (mockInput.onchange) {
        mockInput.onchange({ target: { files: [mockFile] } });
      }

      // Simulate FileReader error
      if (mockFileReaderInstance.onerror) {
        mockFileReaderInstance.onerror();
      }

      const result = await loadPromise;
      expect(result).toBe(null);
    });

    it('should return parsed state for valid YAML file', async () => {
      const mockCreateElement = vi.spyOn(document, 'createElement');
      const mockInput = {
        type: '',
        accept: '',
        click: vi.fn(),
        onchange: null,
      };
      mockCreateElement.mockReturnValue(mockInput);

      const validState = {
        metadata: { version: '1.0.0', bookname: 'Test Book' },
        character: { name: 'Hero' },
      };
      const yamlContent = yaml.dump(validState);

      const mockFileReaderInstance = {
        readAsText: vi.fn(),
        onload: null,
        result: yamlContent,
      };

      global.FileReader = class MockFileReader {
        constructor() {
          return mockFileReaderInstance;
        }
      };

      const loadPromise = loadFromFile();
      const mockFile = new File([yamlContent], 'test.yaml', {
        type: 'text/yaml',
      });
      if (mockInput.onchange) {
        mockInput.onchange({ target: { files: [mockFile] } });
      }

      // Simulate FileReader success
      if (mockFileReaderInstance.onload) {
        mockFileReaderInstance.onload({ target: { result: yamlContent } });
      }

      const result = await loadPromise;
      expect(result).toEqual(validState);
    });

    it('should return null for non-object YAML content', async () => {
      const mockCreateElement = vi.spyOn(document, 'createElement');
      const mockInput = {
        type: '',
        accept: '',
        click: vi.fn(),
        onchange: null,
      };
      mockCreateElement.mockReturnValue(mockInput);

      const mockFileReaderInstance = {
        readAsText: vi.fn(),
        onload: null,
        result: '123',
      };

      global.FileReader = class MockFileReader {
        constructor() {
          return mockFileReaderInstance;
        }
      };

      const loadPromise = loadFromFile();
      const mockFile = new File(['123'], 'test.yaml', { type: 'text/yaml' });
      if (mockInput.onchange) {
        mockInput.onchange({ target: { files: [mockFile] } });
      }

      if (mockFileReaderInstance.onload) {
        mockFileReaderInstance.onload({ target: { result: '123' } });
      }

      const result = await loadPromise;
      expect(result).toBe(null);
    });
  });
});
