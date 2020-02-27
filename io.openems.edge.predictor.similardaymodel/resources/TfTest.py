from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import argparse
import io
import time
import numpy as np


from PIL import Image
from tflite_runtime.interpreter import Interpreter
#import tensorflow as tf


def load_labels(path):
  with open(path, 'r') as f:
    return {i: line.strip() for i, line in enumerate(f.readlines())}


def set_input_tensor(interpreter, image):
  tensor_index = interpreter.get_input_details()[0]['index']
  input_tensor = interpreter.tensor(tensor_index)()[0]
  input_tensor[:, :] = image


def classify_image(interpreter, image, top_k=1):
  """Returns a sorted array of classification results."""
  set_input_tensor(interpreter, image)
  interpreter.invoke()
  output_details = interpreter.get_output_details()[0]
  output = np.squeeze(interpreter.get_tensor(output_details['index']))

  # If the model is quantized (uint8 data), then dequantize the results
  if output_details['dtype'] == np.uint8:
    scale, zero_point = output_details['quantization']
    output = scale * (output - zero_point)

  ordered = np.argpartition(-output, top_k)
  return [(i, output[i]) for i in ordered[:top_k]]


def prepare_image(file):
    img_path = ''
    img = Image.open(img_path + file).resize((224, 224), Image.ANTIALIAS)
    #img_array = Image.img_to_array(img)
    #img_array_expanded_dims = np.expand_dims(img_array, axis=0)
    #return keras.applications.mobilenet.preprocess_input(img_array_expanded_dims)
    return img

def main():
  parser = argparse.ArgumentParser(
      formatter_class=argparse.ArgumentDefaultsHelpFormatter)
  parser.add_argument(
      '--model', help='File path of .tflite file.', required=True)
  parser.add_argument(
      '--labels', help='File path of labels file.', required=True)
  args = parser.parse_args()

  labels = load_labels(args.labels)

  interpreter = Interpreter(args.model)
  interpreter.allocate_tensors()
  _, height, width, _ = interpreter.get_input_details()[0]['shape']

  print(height)
  print(width)

  pre_image = prepare_image('cat.jpg')
  predictions = classify_image(interpreter, pre_image)
  print(predictions)


if __name__ == '__main__':
  main()